/**
 * Block Command - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- DESIGN AGM ---
const AGM_BLOCK = (user) => `╭╼━≪• sʏsᴛᴇᴍ ʙʟᴏᴄᴋ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🚫 ʀᴇsᴛʀɪᴄᴛᴇᴅ
┃ ᴛᴀʀɢᴇᴛ : @${user.split('@')[0]}
┃ sᴄᴏᴘᴇ : ɢʟᴏʙᴀʟ ʙᴀɴ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'block',
  aliases: ['banuser'],
  category: 'owner',
  description: 'Bloquer un utilisateur pour qu\'il ne puisse plus interagir avec le bot.',
  usage: '.block @user ou répondre à son message',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      let target;

      // 1. Extraction du JID (depuis un reply ou une mention)
      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      if (quoted?.participant) {
        target = quoted.participant;
      } else if (quoted?.mentionedJid && quoted.mentionedJid.length > 0) {
        target = quoted.mentionedJid[0];
      } else if (args[0] && args[0].includes('@')) {
        target = args[0].replace('@', '') + '@s.whatsapp.net';
      }

      if (!target) {
        return reply('⚠️ *Veuillez mentionner un utilisateur ou répondre à son message.*');
      }

      // 2. Sécurité : Ne pas bloquer le bot ou le propriétaire
      if (target.includes(sock.user.id.split(':')[0])) {
        return reply('❌ *Erreur : Tu ne peux pas bloquer le bot lui-même.*');
      }

      await react('🚫');

      // 3. Exécution du blocage via Baileys
      await sock.updateBlockStatus(target, 'block');

      // 4. Confirmation avec mentions
      return sock.sendMessage(from, {
        text: AGM_BLOCK(target),
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[BLOCK ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};
