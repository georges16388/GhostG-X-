/**
 * WhatsApp Channel Info Command - GhostG-X Edition
 * Extrait les informations d'un canal WhatsApp et affiche sa vraie Newsletter native
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ɪɴғᴏs_ᴄᴀɴᴀʟ',
  aliases: ['newsletter', 'channel', 'canal', 'channelid'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ʟᴀ ɴᴇᴡsʟᴇᴛᴛᴇʀ ᴅᴇᴘᴜɪs ʟᴇ ʟɪᴇɴ ᴅ\'ᴜɴᴇ ᴄʜᴀɪ̂ɴᴇ ᴡʜᴀᴛsᴀᴘᴘ',
  usage: `${prefix}ɪɴғᴏs_ᴄᴀɴᴀʟ <ʟɪᴇɴ_ᴄᴀɴᴀʟ>`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;

    try {
      const text = args.join(' ');

      // Extraction propre du lien de canal s'il est noyé dans du texte
      const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/([A-Za-z0-9]+)/);

      if (!linkMatch) {
        return await reply(`*〆 ɪɴᴠᴏ́ǫᴜᴇ ᴜɴ ʟɪᴇɴ ᴅᴇ ᴄᴀɴᴀʟ ᴠᴀʟɪᴅᴇ !*\n\n*ᴇxᴇᴍᴘʟᴇ : _${prefix}ɪɴғᴏs_ᴄᴀɴᴀʟ https://whatsapp.com/channel/xxxxxxxxx_*`);
      }

      const channelLink = linkMatch[0];
      const inviteCode = linkMatch[1]; // Le code unique après /channel/

      await reply('*📡 ɪɴᴛᴇʀʀᴏɢᴀᴛɪᴏɴ ᴅᴇs ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ ᴇɴ ᴄᴏᴜʀs...*');

      // 🛡️ MÉTHODE NATIVE BAILEYS : Récupération des données réelles du canal
      const data = await sock.newsletterMetadata("invite", inviteCode);

      if (!data) {
        throw new Error('Impossible de lire les données de ce canal.');
      }

      // Formatage ID JID de la newsletter (obligatoire pour générer le widget)
      const newsletterJid = data.id || `${inviteCode}@newsletter`;

      // 🚀 GÉNÉRATION DU VRAI WIDGET NEWSLETTER NATIF
      await sock.sendMessage(chatId, {
        contacts: {
          displayName: data.name || 'Canal WhatsApp',
          contacts: [{
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name || 'Canal'}\nEND:VCARD`
          }]
        },
        // Injection du contexte natif de la chaîne
        contextInfo: {
          mentionedJid: [msg.sender],
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            serverMessageId: 1,
            newsletterName: data.name || 'Canal WhatsApp'
          }
        }
      }, { quoted: msg });

      // Envoi d'un petit récapitulatif textuel stylisé en dessous pour compléter le tout
      const recapText = 
        `*╭╼━━━≪• sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́ •≫━━━╾╮*\n\n` +
        `*📢 ᴄᴀɴᴀʟ :* ${data.name || 'ɪɴᴄᴏɴɴᴜ'}\n` +
        `*🆔 ᴊɪᴅ :* ${newsletterJid}\n` +
        `*👥 ᴀʙᴏɴɴᴇ́s :* ${data.subscribers || 'ᴄᴀᴄʜᴇ́'}\n\n` +
        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await sock.sendMessage(chatId, { text: recapText }, { quoted: msg });

    } catch (error) {
      console.error('Error in channel command:', error);
      await reply(`*〆 ʟ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ :* ʟᴇs ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ sᴏɴᴛ ɪɴᴀᴄᴄᴇssɪʙʟᴇs.`);
    }
  }
};
