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

// Hardcoded Admin List for critical operations & role assignment
const ALLOWED_ADMINS = [
    "yankele13@gmail.com", 
    "contact@gaddoors.com" 
];

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
// 1. Send an email reply from Admin Dashboard
exports.sendEmailReply = onCall(async (request) => {
    // 1. Auth Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Connectez-vous.');
    }

    // 2. RBAC Check (Admin Only)
    // First, check hardcoded list (Fast & Robust)
    const userEmail = request.auth.token.email;
    if (ALLOWED_ADMINS.includes(userEmail)) {
        // Authorized by Email List
    } else {
        // Fallback: Check Firestore Role
        try {
            const userRef = db.collection('users').doc(request.auth.uid);
            const userSnap = await userRef.get();
            if (!userSnap.exists() || userSnap.data().role !== 'admin') {
                throw new HttpsError('permission-denied', 'Administrateur requis.');
            }
        } catch (e) {
            console.warn(`Unauthorized Access Attempt by ${request.auth.uid}`);
            throw new HttpsError('permission-denied', 'Accès non autorisé.');
        }
    }

    const { recipientEmail, subject, text, messageId } = request.data;
    if (!recipientEmail || !text) throw new HttpsError('invalid-argument', 'Champs manquants.');

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
                 lastReply: text,
                 // Audit who replied
                 repliedBy: request.auth.uid 
             });
        }
        return { success: true };
    } catch (error) {
        console.error("Email Send Error:", error);
        throw new HttpsError('internal', error.message);
    }
});

// ... (previous code)

/**
 * 2. Notification Trigger: Email Admin when new message arrives
 */
exports.onNewMessage = onDocumentCreated("messages/{messageId}", async (event) => {
    // ... (existing notification logic)
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

/**
 * 3. Audit Log Trigger: Securely record all Product changes
 * Replaces client-side _logAudit
 */
const { onDocumentWritten } = require("firebase-functions/v2/firestore");

exports.onProductWrite = onDocumentWritten("products/{productId}", async (event) => {
    const eventType = !event.data.before.exists ? 'create' 
                    : !event.data.after.exists ? 'delete' 
                    : 'update';
    
    const docId = event.params.productId;
    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    // Get who did it? 
    // Triggers don't always have auth context easily in v2 without Identity Platform blocking functions.
    // However, for typical firestore usage, we often rely on the document itself having 'updatedBy' metadata 
    // OR we accept that 'system' did it if strictly backend.
    // Ideally, the client writes 'metadata.updatedBy' to the doc (which we check in Rules!).
    // We trust that field because Rules prevent falsifying it (todo: add rule for that).
    
    const userEmail = newData?.metadata?.updatedBy || newData?.metadata?.createdBy || 'unknown';

    try {
        await db.collection('audit_logs').add({
            entityCollection: 'products',
            entityId: docId,
            action: eventType,
            timestamp: FieldValue.serverTimestamp(),
            user: userEmail,
            details: {
                // Store diffs or snapshots. Let's store compact snapshot.
                before: eventType === 'update' || eventType === 'delete' ? oldData : null,
                after: eventType === 'create' || eventType === 'update' ? newData : null
            }
        });
        console.log(`Audit Log created for Product ${docId} (${eventType})`);
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
});

/**
 * 4. User Trigger: Securely Assign Roles on Creation
 * Prevents Privilege Escalation by handling roles on the backend.
 */
exports.onUserCreate = onDocumentCreated("users/{userId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const userId = event.params.userId;

    // RULE: Only the server decides who is admin.
    // We check a hardcoded list OR a separate secure collection.
    // For now, we trust the env var or hardcoded list.
    // const ALLOWED_ADMINS = [ ... ] (Moved to top level)

    let assignedRole = 'viewer';
    if (ALLOWED_ADMINS.includes(data.email)) {
        assignedRole = 'admin';
    }

    // Force the role to what the SERVER decides, ignoring what the client sent.
    // We only update if it differs to avoid infinite loops (though update matches 'create' trigger so loop risk is low, 
    // but onWrite would loop. onDocumentCreated only triggers once per doc creation).
    if (data.role !== assignedRole) {
        await snapshot.ref.update({ role: assignedRole });
        console.log(`Security: Reset role for ${data.email} to ${assignedRole}`);
    }
});
