/**
 * Clean Command - AGM Purge Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (deleted, total) => `╭╼━≪• ᴘᴜʀɢᴇ sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴄᴏᴍᴘʟᴇᴛᴇᴅ
┃ ᴅᴇʟᴇᴛᴇᴅ : ${deleted} / ${total} 🗑️
┃ sᴄᴏᴘᴇ : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear'],
  category: 'admin',
  description: 'Clean messages (all or from specific user if replied)',
  usage: '.clean <number>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const count = parseInt(args[0]);
      if (!count || count < 1 || count > 100) {
        return extra.reply('⚠️ *Veuillez entrer un nombre valide (1-100).*');
      }

      const jid = extra.from;
      const { store } = require('../../index');

      // Check if message is a reply
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const msgs = store.messages[jid];
      if (!msgs) {
        return extra.reply('⚠️ *Aucun message trouvé dans la mémoire du bot.*');
      }

      let messagesToDelete = [];

      if (quotedParticipant) {
        // Mode: Delete specific user's messages
        messagesToDelete = Object.values(msgs)
          .filter(m => {
            const sender = m.key.participant || m.key.remoteJid;
            return sender === quotedParticipant;
          })
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      } else {
        // Mode: Delete last N messages from chat
        messagesToDelete = Object.values(msgs)
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      }

      if (messagesToDelete.length === 0) {
        return extra.reply('⚠️ *Aucun message à supprimer.*');
      }

      await sock.sendMessage(jid, { react: { text: "🧹", key: msg.key } });

      let deletedCount = 0;
      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(jid, { delete: m.key });
          deletedCount++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 350));
        } catch (err) {
          console.error('[clean] delete error:', err.message);
        }
      }

      // Envoi du rapport de purge final
      return extra.reply(AGM_DESIGN(deletedCount, count));

    } catch (e) {
      console.error('[clean cmd] error:', e);
      extra.reply('❌ *Échec du nettoyage du chat.*');
    }
  }
};
