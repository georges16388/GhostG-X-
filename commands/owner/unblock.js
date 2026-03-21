/**
 * User Unblocking System - AGM Security Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (RESTORE STYLE) ---
const AGM_UNBAN = (user) => `╭╼━≪• ᴀɢᴍ ᴜɴʙʟᴏᴄᴋ sʏsᴛᴇᴍ •≫━╾╮
┃ ᴛᴀʀɢᴇᴛ : @${user.split('@')[0]}
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇsᴛᴏʀᴇᴅ
┃ ᴀᴄᴄᴇss : ɢʀᴀɴᴛᴇᴅ ✅
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'unblock',
  aliases: ['unban'],
  category: 'owner',
  description: 'Débloquer un utilisateur',
  usage: '.unblock @user ou répondre à son message',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      let target;
      
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      // Détection de la cible (mention ou réponse au message cité)
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ.*');
      }

      await sock.sendMessage(extra.from, { react: { text: '🔓', key: msg.key } });

      // Action de déblocage sur WhatsApp
      await sock.updateBlockStatus(target, 'unblock');
      
      // Message de confirmation avec Design AGM
      await sock.sendMessage(extra.from, {
        text: AGM_UNBAN(target),
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Unblock Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ : ${error.message}*`);
    }
  }
};
