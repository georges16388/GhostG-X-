/**
 * User Blocking System - AGM Security Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (BAN STYLE) ---
const AGM_BAN = (user) => `╭╼━≪• ᴀɢᴍ ʙʟᴏᴄᴋ sʏsᴛᴇᴍ •≫━╾╮
┃ ᴛᴀʀɢᴇᴛ : @${user.split('@')[0]}
┃ sᴛᴀᴛᴜs : 🔴 ʙʟᴏᴄᴋᴇᴅ
┃ ᴀᴄᴄᴇss : ᴅᴇɴɪᴇᴅ ❌
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'block',
  aliases: ['banuser', 'ban'],
  category: 'owner',
  description: 'Bloquer un utilisateur définitivement',
  usage: '.block @user ou répondre à son message',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      let target;
      
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      // Détection de la cible (mention ou réponse)
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ.*');
      }

      // Sécurité : Ne pas se bloquer soi-même ou le bot
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      if (target === botId) {
        return extra.reply('🚫 *ᴊᴇ ɴᴇ ᴘᴇᴜx ᴘᴀs ᴍᴇ ʙʟᴏǫᴜᴇʀ ᴍᴏɪ-ᴍêᴍᴇ.*');
      }

      await sock.sendMessage(extra.from, { react: { text: '🚫', key: msg.key } });

      // Action de blocage
      await sock.updateBlockStatus(target, 'block');
      
      // Message final avec Design AGM et mentions
      await sock.sendMessage(extra.from, {
        text: AGM_BAN(target),
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Block Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ : ${error.message}*`);
    }
  }
};
