/**
 * @fileOverview Firebase Cloud Functions for integrating with Whop Payments.
 *
 * This file contains two main functions:
 * 1. `createWhopCheckoutSession`: A callable function that creates a checkout session
 *    with Whop and returns a URL for the client to redirect to.
 * 2. `handleWhopWebhook`: An HTTP function that listens for webhooks from Whop,
 *    specifically for the 'membership.created' event, to grant premium access to users.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
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

/**
 * Creates a Whop checkout session for an authenticated user.
 *
 * This function must be called by an authenticated Firebase user. It passes the
 * user's Firebase UID to Whop in the metadata to link the payment to the user's account.
 *
 * @param {object} request - The request object from the client.
 * @param {string} request.data.planId - The ID of the Whop plan to purchase.
 * @returns {Promise<{url: string}>} A promise that resolves with the checkout URL from Whop.
 * @throws {HttpsError} Throws 'unauthenticated' if the user is not logged in.
 * @throws {HttpsError} Throws 'invalid-argument' if 'planId' is missing.
 * @throws {HttpsError} Throws 'internal' for any other errors during the process.
 */
exports.createWhopCheckoutSession = onCall(async (request) => {
    // 1. Security: Ensure the user is authenticated.
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = request.auth.uid;
    const { planId } = request.data;

    // 2. Input Validation: Ensure planId is provided.
    if (!planId) {
        throw new HttpsError("invalid-argument", "The function must be called with a 'planId'.");
    }

    logger.info(`Creating Whop checkout session for user: ${uid}, plan: ${planId}`);

    try {
        // 3. Action: Make a POST request to the Whop API.
        const response = await axios.post(
            'https://api.whop.com/v2/checkout_sessions',
            {
                plan_id: planId,
                metadata: {
                    // 4. Metadata Requirement: Pass the Firebase UID.
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
        
        // 5. Return: Send the URL back to the client.
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
 *
 * This function listens for the 'membership.created' event and updates the
 * user's document in Firestore to grant premium access.
 *
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
exports.handleWhopWebhook = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        logger.warn("Webhook received with non-POST method", { method: req.method });
        res.status(405).send('Method Not Allowed');
        return;
    }
    
    const event = req.body;
    
    // 1. Action: Listen for the 'membership.created' event.
    if (event.type === 'membership.created') {
        const membership = event.data.object;
        
        // 2. Logic: Extract firebase_uid from metadata.
        const firebaseUid = membership.metadata ? membership.metadata.firebase_uid : null;
        const whopSubscriptionId = membership.id;

        if (firebaseUid) {
            logger.info(`Processing 'membership.created' for Firebase UID: ${firebaseUid}, Whop Sub ID: ${whopSubscriptionId}`);
            
            try {
                // 3. Database: Update the user's document in Firestore.
                const userRef = db.collection('users').doc(firebaseUid);
                await userRef.update({
                    isPremium: true,
                    whopSubscriptionId: whopSubscriptionId,
                    planId: membership.plan.id, // Store plan ID for future reference
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
