/**
 * Cloud Functions for Gaddoors
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore"); // Import Trigger
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore();

/**
 * Helper: Create Transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN
        }
    });
}

/**
 * 1. Send an email reply from Admin Dashboard
 */
exports.sendEmailReply = onCall(async (request) => {
    // Auth Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Vous devez être connecté.');
    }

    const { recipientEmail, subject, text, messageId } = request.data;
    if (!recipientEmail || !text) throw new HttpsError('invalid-argument', 'Missing fields.');

    const alias = process.env.GMAIL_ALIAS || "contact@gaddoors.com";

    try {
        const transporter = createTransporter();
        
        await transporter.sendMail({
            from: `"Gad Doors" <${alias}>`, 
            to: recipientEmail,
            subject: subject,
            text: text, 
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    ${text.replace(/\n/g, '<br>')}
                   </div>`
        });

        if (messageId) {
             await db.collection('messages').doc(messageId).update({
                 status: 'replied',
                 read: true,
                 repliedAt: FieldValue.serverTimestamp(),
                 lastReply: text
             });
        }
        return { success: true };
    } catch (error) {
        console.error("Email Send Error:", error);
        throw new HttpsError('internal', error.message);
    }
});

/**
 * 2. Notification Trigger: Email Admin when new message arrives
 */
exports.onNewMessage = onDocumentCreated("messages/{messageId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const msg = snapshot.data();
    const adminEmail = process.env.GMAIL_USER; // yankele13@gmail.com

    try {
        const transporter = createTransporter();

        const emailContent = `
            <h2>Nouveau message reçu</h2>
            <p><strong>De:</strong> ${msg.name} (${msg.email})</p>
            <p><strong>Tel:</strong> ${msg.phone || 'Non renseigné'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
                ${msg.message}
            </blockquote>
            <p><a href="https://gaddoors-51c99.web.app/admin/crm/messages">Répondre depuis l'admin</a></p>
        `;

        await transporter.sendMail({
            from: `"Gad Doors Bot" <${adminEmail}>`,
            to: adminEmail,
            subject: `🔔 Nouveau Message: ${msg.name}`,
            html: emailContent
        });

        console.log(`Notification sent to ${adminEmail} for message ${event.params.messageId}`);
    } catch (error) {
        console.error("Notification Error:", error);
    }
});
