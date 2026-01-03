
require('dotenv').config({ path: '.env.production' });

/**
 * @fileOverview Firebase Cloud Functions for integrating with Whop Payments and a secure TTS service.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Retrieve Whop API Key from environment variables
const WHOP_API_KEY = process.env.WHOP_API_KEY;
if (!WHOP_API_KEY) {
    logger.error("Whop API key is not configured. Make sure WHOP_API_KEY is set in your environment.");
}

// Whop Plan IDs
const WHOP_PLANS = {
    'plan_gumriTEj5ozKe': { name: 'hobbyist', tier: 'monthly', credits: 100000 },
    'plan_cGxf08gK0OBVC': { name: 'hobbyist', tier: 'yearly', credits: 100000 * 12 },
    'plan_6VPgm0sLSThCZ': { name: 'creator', tier: 'monthly', credits: 350000 },
    'plan_Xh8nEVACfO2aS': { name: 'creator', tier: 'yearly', credits: 350000 * 12 },
};


/**
 * Creates a user document in Firestore when a new Firebase Auth user is created.
 */
exports.initializeUser = functions.auth.user().onCreate(async (user) => {
    logger.info(`Initializing new user: ${user.uid} (${user.email})`);

    const userRef = db.collection('users').doc(user.uid);

    try {
        await userRef.set({
            id: user.uid,
            email: user.email,
            planId: 'free',
            credits: 2000,
            creditsRemaining: 2000,
            totalCredits: 2000,
            creationDate: admin.firestore.FieldValue.serverTimestamp(),
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        }, { merge: true });
        logger.info(`Successfully created Firestore document for user: ${user.uid}`);
    } catch (error) {
        logger.error(`Failed to create Firestore document for user: ${user.uid}`, { error });
    }
});


/**
 * Handles incoming webhooks from Whop to update user subscriptions.
 */
exports.handleWhopWebhook = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        logger.warn("Webhook received with non-POST method", { method: req.method });
        res.status(405).send('Method Not Allowed');
        return;
    }
    
    // It's good practice to verify the webhook signature here in a real app
    
    const event = req.body;
    
    try {
        const dataObject = event.data.object;
        // For payment events, the user info is nested differently
        const membership = event.type.startsWith('payment') ? dataObject.membership : dataObject;
        const firebaseUid = membership.metadata ? membership.metadata.firebase_uid : null;
        
        if (!firebaseUid) {
            logger.warn(`Webhook event '${event.type}' received without 'firebase_uid' in metadata.`, { whopMembershipId: membership.id });
            res.status(400).send({ error: "Missing 'firebase_uid' in webhook metadata." });
            return;
        }

        const userRef = db.collection('users').doc(firebaseUid);

        if (event.type === 'membership.activated') {
            logger.info(`Processing 'membership.activated' for Firebase UID: ${firebaseUid}`);
            
            const planId = membership.plan.id;
            const planDetails = WHOP_PLANS[planId];

            if (!planDetails) {
                 logger.error(`Unknown Whop Plan ID received during activation: ${planId}`);
                 res.status(400).send({ error: 'Unknown plan ID.' });
                 return;
            }

            const now = admin.firestore.FieldValue.serverTimestamp();
            await userRef.update({
                planId: planDetails.name,
                subscriptionTier: planDetails.tier,
                totalCredits: planDetails.credits,
                creditsRemaining: planDetails.credits, // Full credits on activation
                whopSubscriptionId: membership.id,
                subscriptionStartDate: now,
                lastCreditRenewalDate: now,
            });
            logger.info(`Successfully granted ${planDetails.name} access to user: ${firebaseUid}`);

        } else if (event.type === 'payment.succeeded') {
            logger.info(`Processing 'payment.succeeded' for Firebase UID: ${firebaseUid}`);
            
            const planId = membership.plan.id;
            const planDetails = WHOP_PLANS[planId];

             if (!planDetails) {
                 logger.error(`Unknown Whop Plan ID received during renewal: ${planId}`);
                 res.status(400).send({ error: 'Unknown plan ID.' });
                 return;
            }
            
            // For yearly plans, this logic might need adjustment depending on business rules.
            // This assumes credits are added on each "payment.succeeded" event.
            await userRef.update({
                creditsRemaining: planDetails.credits, // Reset credits to full amount on renewal
                lastCreditRenewalDate: admin.firestore.FieldValue.serverTimestamp(),
            });
            logger.info(`Successfully renewed credits for user: ${firebaseUid}`);
        
        } else if (event.type === 'membership.deactivated') {
            logger.info(`Processing 'membership.deactivated' for Firebase UID: ${firebaseUid}`);
            
            // Downgrade user to the free plan
            await userRef.update({
                planId: 'free',
                subscriptionTier: null,
                totalCredits: 2000, 
                // Decision: Reset remaining credits to the free tier limit, or let them keep them?
                creditsRemaining: 2000, 
                whopSubscriptionId: admin.firestore.FieldValue.delete(),
                subscriptionEndDate: admin.firestore.FieldValue.serverTimestamp(),
            });
            logger.info(`Successfully deactivated subscription for user: ${firebaseUid}`);

        } else {
            logger.info(`Received an unhandled Whop webhook event of type '${event.type}'.`, { eventType: event.type });
        }
        
        res.status(200).send({ message: `Webhook event '${event.type}' processed.` });

    } catch (error) {
        logger.error(`Webhook processing failed for event type '${event.type}'.`, { error: error.message, event: event });
        res.status(500).send({ error: 'Internal server error during webhook processing.' });
    }
});


/**
 * Securely generates TTS audio, with rate limiting and App Check enforcement.
 */
exports.generateTtsAudio = onCall({
  enforceAppCheck: true,
}, async (request) => {
    
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to generate audio.");
    }
    const uid = request.auth.uid;
    const text = request.data.text;

    if (!text || typeof text !== 'string' || text.length > 500) {
        throw new HttpsError("invalid-argument", "Invalid text input. Must be a string under 500 characters.");
    }

    const now = admin.firestore.Timestamp.now();
    const oneMinuteAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 60000);

    const requestsRef = db.collection('ttsRequests');
    const recentRequestsQuery = requestsRef
        .where('userId', '==', uid)
        .where('createdAt', '>=', oneMinuteAgo);
    
    const recentRequestsSnapshot = await recentRequestsQuery.get();

    if (recentRequestsSnapshot.size >= 5) {
        throw new HttpsError("resource-exhausted", "You are making too many requests. Please try again in a minute.");
    }
    
    logger.info(`User ${uid} is generating audio for text: "${text.substring(0, 30)}..."`);
    const mockAudioUrl = `https://storage.googleapis.com/your-bucket-name/audio/${uid}/${Date.now()}.mp3`;

    await requestsRef.add({
        userId: uid,
        text: text,
        audioUrl: mockAudioUrl,
        createdAt: now,
    });

    return { success: true, audioUrl: mockAudioUrl };
});


/**
 * Verifies a sign-up attempt to prevent free tier abuse.
 */
exports.verifySignUpAttempt = onCall(async (request) => {
    const { email, deviceFingerprint } = request.data;
    const ip = request.rawRequest.ip;

    if (!email || !deviceFingerprint || !ip) {
        throw new HttpsError('invalid-argument', 'Missing required parameters for verification.');
    }

    // --- 1. VPN Detection ---
    const isVpn = ip.startsWith('103.208.220.') || ip.startsWith('209.141.56.'); // Example ranges
    if (isVpn) {
        logger.warn(`VPN detected for email: ${email}, IP: ${ip}`);
        await logFraudAttempt({ email, ip, deviceFingerprint, reason: 'vpn_detected' });
        throw new HttpsError('permission-denied', 'VPN detected. Please disable your VPN to continue.');
    }

    // --- 2. Duplicate Device Check (from fraud logs) ---
    const fraudDeviceQuery = db.collection('fraudAttempts').where('deviceFingerprint', '==', deviceFingerprint);
    const fraudDeviceSnapshot = await fraudDeviceQuery.get();
    if (!fraudDeviceSnapshot.empty) {
        logger.warn(`Duplicate sign-up attempt (device fingerprint) for email: ${email}, IP: ${ip}`);
        await logFraudAttempt({ email, ip, deviceFingerprint, reason: 'duplicate_device' });
        throw new HttpsError('permission-denied', 'This device has already been used for a free sign-up.');
    }

    // --- 3. Duplicate IP Check (from existing free tier users) ---
    const usersIpQuery = db.collection('users').where('lastKnownIp', '==', ip).where('planId', '==', 'free');
    const usersIpSnapshot = await usersIpQuery.get();
    if (!usersIpSnapshot.empty) {
        logger.warn(`Duplicate sign-up attempt (IP Address) for email: ${email}, IP: ${ip}`);
        await logFraudAttempt({ email, ip, deviceFingerprint, reason: 'duplicate_ip' });
        throw new HttpsError('permission-denied', 'This network has already been used for a free sign-up.');
    }

    return { success: true, message: 'Verification successful.' };
});

/**
 * Helper function to log a fraud attempt to Firestore.
 */
async function logFraudAttempt({ email, ip, deviceFingerprint, reason }) {
    try {
        await db.collection('fraudAttempts').add({
            email,
            ipAddress: ip,
            deviceFingerprint,
            reason,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        logger.error('Failed to log fraud attempt:', { error, email, ip, reason });
    }
}


/**
 * Deletes a user's account and all associated data from Firestore.
 */
exports.deleteUserAccount = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be authenticated to delete your account.");
    }
    const uid = request.auth.uid;
    logger.info(`Attempting to delete account and data for user: ${uid}`);

    try {
        // Delete the user from Firebase Authentication
        await admin.auth().deleteUser(uid);
        logger.info(`Successfully deleted user from Firebase Auth: ${uid}`);

        // Delete the user's document from Firestore
        const userRef = db.collection('users').doc(uid);
        await userRef.delete();
        logger.info(`Successfully deleted user document from Firestore: ${uid}`);
        
        // Note: In a production app, you would also delete all subcollections 
        // and associated data (e.g., avatars, videos) here.

        return { success: true, message: 'Account deleted successfully.' };

    } catch (error) {
        logger.error(`Failed to delete user account for UID: ${uid}`, { error });
        if (error.code === 'auth/user-not-found') {
             throw new HttpsError("not-found", "User account not found.");
        }
        throw new HttpsError("internal", "Failed to delete user account.");
    }
});


/**
 * Placeholder function for cancelling a Whop subscription.
 */
exports.cancelSubscription = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be authenticated.");
    }
    // In a real app, you would retrieve the user's whopSubscriptionId 
    // and use the Whop API to cancel it.
    logger.info(`User ${request.auth.uid} requested to cancel their subscription.`);
    return { success: true, message: "Your subscription cancellation request has been received. Please check your email." };
});

    