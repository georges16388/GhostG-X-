import sender from "../commands/sender.js";

async function dlt(client, message) {
  try {
    const quotedMessageInfo = message.message?.extendedTextMessage?.contextInfo;

    if (!quotedMessageInfo || !quotedMessageInfo.quotedMessage) {
      sender(message, client, "❌ Please reply to a message to delete it.");
      return;
    }

    const chatId = message.key.remoteJid;
    const quotedKey = quotedMessageInfo?.quotedMessage?.key || quotedMessageInfo.key;
    const senderId = quotedMessageInfo?.participant || chatId;
    const isFromBot = senderId === client.user.id;

    if (!quotedKey || !chatId) {
      sender(message, client, "❌ Could not find the message to delete.");
      return;
    }

    console.log(`🗑 Attempting to delete message in ${chatId}`);

    try {
      // Tentative de suppression pour tous (si possible)
      await client.sendMessage(chatId, { delete: quotedKey });
      console.log("✅ Message deleted successfully.");
      return;
    } catch (error) {
      console.warn("⚠️ Could not delete for everyone. Trying self-deletion...");

      // Si échec, supprimer seulement si le message est du bot
      if (isFromBot) {
        try {
          await client.sendMessage(chatId, { delete: quotedKey });
          console.log("✅ Message deleted for self.");
          return;
        } catch (err) {
          console.error("❌ Failed to delete for self:", err);
          sender(message, client, "❌ Unable to delete the message.");
        }
      } else {
        sender(
          message,
          client,
          "❌ Cannot delete this message. Bot might not have admin rights or it’s someone else’s message."
        );
      }
    }
  } catch (err) {
    console.error("❌ Error deleting message:", err);
    sender(message, client, "❌ Failed to delete the message due to an error.");
  }
}

export default dlt;