/**
 * User Unblocking System - AGM Security Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (RESTORE STYLE) ---
const AGM_UNBAN = (user) => `╭╼━≪• ᴀɢᴍ ᴜɴʙʟᴏᴄᴋ sʏsᴛᴇᴍ •≫━╾╮
┃ ᴛᴀʀɢᴇᴛ : @${user.split('@')[0]}
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇsᴛᴏʀᴇᴅ
┃ ᴀᴄᴄᴇss : ɢʀᴀɴᴛᴇᴅ ✅
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'unblock',
  aliases: ['unban'],
  category: 'owner',
  description: 'Débloquer un utilisateur sur WhatsApp.',
  usage: '.unblock @user (ou répondre à un message)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      let target;

      // 1. Détection de la cible (Mention > Réponse > Argument)
      if (ctx?.mentionedJid && ctx.mentionedJid.length > 0) {
        target = ctx.mentionedJid[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else if (args[0]) {
        target = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      }

      if (!target) {
        return sock.sendMessage(from, { text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ.*' }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '🔓', key: msg.key } });

      // 2. Action de déblocage (WhatsApp API)
      await sock.updateBlockStatus(target, 'unblock');

      // 3. Confirmation avec Design AGM
      await sock.sendMessage(from, {
        text: AGM_UNBAN(target),
        mentions: [target]
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Unblock Error:', error);
      await sock.sendMessage(extra.from, { text: `❌ *ᴇʀʀᴇᴜʀ : ${error.message}*` }, { quoted: msg });
    }
  }
};
