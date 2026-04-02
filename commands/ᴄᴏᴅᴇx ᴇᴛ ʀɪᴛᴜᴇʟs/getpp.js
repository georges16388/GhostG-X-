/**
 * GetPP Command - Get profile picture of a user
 * GhostG-X Edition
 */

const config = require('../../config.js');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic', 'pp'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇᴄᴜᴘᴇʀᴇ ʟᴀ ᴘʜᴏᴛᴏ ᴅᴇ ᴘʀᴏғɪʟ ᴅ\'ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ',
  
  get usage() {
    const activePrefix = config.prefix || '.';
    return `${activePrefix}getpp [@mention / reponse]`;
  },

  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const prefix = config.prefix || '.';

    try {
      let targetUser = null;

      // 1. Extraction de la cible (Reply ou Tag)
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        targetUser = mentioned[0];
      } else if (ctx?.participant) {
        targetUser = ctx.participant;
      } else {
        // Si rien, on prend l'auteur du message
        targetUser = extra.sender;
      }

      if (!targetUser) {
        return reply(
          `*❌ ${toSmallCaps('veuillez mentionner ou repondre a l\'individu')} !*\n\n` +
          `*${toSmallCaps('exemple')} :* \`${prefix}getpp @user\`\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      try {
        // 2. Tentative de récupération de l'URL de l'image
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');

        if (!ppUrl) {
          return reply(`*❌ ${toSmallCaps('image de profil introuvable pour cet individu')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        // 3. Envoi direct de la photo de profil via l'URL (plus rapide)
        await sock.sendMessage(extra.from, { 
          image: { url: ppUrl },
          caption: `👤 *${toSmallCaps('image de profil de')}* @${targetUser.split('@')[0]}\n\n` +
                   `*_ᴊᴇsᴜs ᴇsᴛ ʀᴏɪ ♛_*\n\n` +
                   `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
          mentions: [targetUser]
        }, { quoted: msg });

      } catch (profileError) {
        // Gestion propre des restrictions de confidentialité WhatsApp
        return reply(`*❌ ${toSmallCaps('image de profil introuvable ou privee')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

    } catch (error) {
      console.error('getpp.js error:', error);
      await reply(`*❌ ${toSmallCaps('erreur')} :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
