import sender from "../commands/sender.js";

async function dlt(client, message) {
    try {
        const quotedMessageInfo = message.message?.extendedTextMessage?.contextInfo;

        if (!quotedMessageInfo || !quotedMessageInfo.quotedMessage) {
            sender(message, client, "❌ Please reply to a message to delete it.");
            return;
        }

        const chatId = message.key.remoteJid;
        const quotedMessageKey = quotedMessageInfo.stanzaId;
        const quotedSender = quotedMessageInfo.participant;
        const isFromBot = quotedSender === client.user.id;

        if (!quotedMessageKey || !chatId) {
            sender(message, client, "❌ Could not find the message to delete.");
            return;
        }

        console.log(`🗑 Attempting to delete message ID: ${quotedMessageKey} in ${chatId}`);

        // Suppression pour tous
        try {
            await client.sendMessage(chatId, { delete: { remoteJid: chatId, id: quotedMessageKey, fromMe: isFromBot } });
            console.log("✅ Message deleted successfully.");
            return;
        } catch (error) {
            console.error("❌ Failed to delete message:", error);
            sender(message, client, "⚠️ Unable to delete message for everyone.");
        }

    } catch (error) {
        console.error("❌ Error deleting message:", error);
        sender(message, client, "❌ Failed to delete the message.");
    }
}

export default dlt;