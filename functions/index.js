
/**
 * @fileOverview Firebase Cloud Functions for integrating with Whop Payments and a secure TTS service.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/on-call");
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
    logger.error("WHOP_API_KEY environment variable not set. Functions will not work correctly.");
}

// Whop Plan IDs
const WHOP_PLANS = {
    hobbyist_monthly: 'plan_gumriTEj5ozKe',
    hobbyist_yearly: 'plan_cGxf08gK0OBVC',
    creator_monthly: 'plan_6VPgm0sLSThCZ',
    creator_yearly: 'plan_Xh8nEVACfO2aS',
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
            creationDate: admin.firestore.FieldValue.serverTimestamp(),
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        });
        logger.info(`Successfully created Firestore document for user: ${user.uid}`);
    } catch (error) {
        logger.error(`Failed to create Firestore document for user: ${user.uid}`, { error });
    }
});


/**
 * Creates a Whop checkout session for an authenticated user.
 */
exports.createWhopCheckoutSession = onCall(async (request) => {
    // Security: Ensure the user is authenticated.
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = request.auth.uid;
    const { planKey } = request.data;

    // Input Validation: Ensure planKey is provided and valid.
    if (!planKey || !WHOP_PLANS[planKey]) {
        throw new HttpsError("invalid-argument", "The function must be called with a valid 'planKey'.");
    }

    const planId = WHOP_PLANS[planKey];
    logger.info(`Creating Whop checkout session for user: ${uid}, plan: ${planId} (key: ${planKey})`);

    try {
        const response = await axios.post(
            'https://api.whop.com/v2/checkout_sessions',
            {
                plan_id: planId,
                metadata: {
                    firebase_uid: uid,
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHOP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }
        );
        
        const checkoutUrl = response.data.url;
        
        if (!checkoutUrl) {
            logger.error("Whop API did not return a URL.", { whopResponse: response.data });
            throw new Error("Could not retrieve checkout URL from Whop.");
        }
        
        logger.info(`Successfully created checkout session for UID: ${uid}. URL: ${checkoutUrl}`);
        
        return { url: checkoutUrl };

    } catch (error) {
        logger.error(`Error creating Whop checkout session for UID: ${uid}`, {
            errorMessage: error.message,
            axiosResponse: error.response ? error.response.data : 'No response from axios',
        });
        throw new HttpsError("internal", "Failed to create a checkout session.");
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
    
    const event = req.body;
    
    if (event.type === 'membership.created') {
        const membership = event.data.object;
        
        const firebaseUid = membership.metadata ? membership.metadata.firebase_uid : null;
        const whopSubscriptionId = membership.id;

        if (firebaseUid) {
            logger.info(`Processing 'membership.created' for Firebase UID: ${firebaseUid}, Whop Sub ID: ${whopSubscriptionId}`);
            
            try {
                const userRef = db.collection('users').doc(firebaseUid);
                await userRef.update({
                    isPremium: true,
                    whopSubscriptionId: whopSubscriptionId,
                    planId: membership.plan.id, 
                });

                logger.info(`Successfully granted premium access to user: ${firebaseUid}`);
                res.status(200).send({ message: 'User updated successfully.' });

            } catch (error) {
                logger.error(`Failed to update user document for UID: ${firebaseUid}`, { error: error.message });
                res.status(500).send({ error: 'Failed to update user in database.' });
            }
        } else {
            logger.warn("'membership.created' webhook received without 'firebase_uid' in metadata.", {
                whopSubscriptionId: whopSubscriptionId,
            });
            res.status(400).send({ error: "Missing 'firebase_uid' in webhook metadata." });
        }
    } else {
        logger.info(`Received a Whop webhook event of type '${event.type}', which is not handled.`, { eventType: event.type });
        res.status(200).send({ message: `Event type '${event.type}' received but not handled.` });
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
