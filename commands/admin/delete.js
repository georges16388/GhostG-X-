/**
 * Delete Command - AGM Precision Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = () => `╭╼━≪• ᴛᴀʀɢᴇᴛ ᴅᴇʟᴇᴛᴇᴅ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 sᴜᴄᴄᴇss
┃ ᴀᴄᴛɪᴏɴ : ᴇʀᴀsᴇᴅ ⚡
┃ ɢᴜᴀʀᴅ : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'delete',
  aliases: ['del', 'dlt'],
  description: 'Delete a replied message',
  usage: '.delete (reply to a message)',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.stanzaId || !ctx?.participant) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ ᴀᴜ ᴍᴇssᴀɢᴇ à sᴜᴘᴘʀɪᴍᴇʀ.*');
      }

      const deleteKey = { 
        remoteJid: extra.from, 
        id: ctx.stanzaId, 
        participant: ctx.participant 
      };

      // Exécution de la suppression
      await sock.sendMessage(extra.from, { delete: deleteKey });
      
      // Réaction de confirmation sur la commande
      await sock.sendMessage(extra.from, { react: { text: "🗑️", key: msg.key } });

      // Petit rapport de confirmation AGM
      return extra.reply(AGM_DESIGN());

    } catch (error) {
      console.error('Delete command error:', error);
      await extra.reply('❌ *ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ sᴜᴘᴘʀᴇssɪᴏɴ ᴅᴜ ᴍᴇssᴀɢᴇ.*');
    }
  }
};
