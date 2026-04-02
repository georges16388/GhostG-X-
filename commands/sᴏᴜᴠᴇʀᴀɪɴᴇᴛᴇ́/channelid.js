/**
 * WhatsApp Channel Info Command - GhostG-X Edition
 * Extrait les informations d'un canal WhatsApp à partir de son lien
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ɪɴғᴏs_ᴄᴀɴᴀʟ',
  aliases: ['newsletter', 'channel', 'canal', 'channelid'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɢᴇ́ɴᴇ̀ʀᴇ ᴜɴᴇ ɴᴇᴡsʟᴇᴛᴛᴇʀ ᴅᴇᴘᴜɪs ʟᴇ ʟɪᴇɴ ᴅ\'ᴜɴᴇ ᴄʜᴀɪ̂ɴᴇ ᴡʜᴀᴛsᴀᴘᴘ',
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

      // 🛡️ MÉTHODE NATIVE BAILEYS : Plus besoin d'API externe instable !
      const data = await sock.newsletterMetadata("invite", inviteCode);

      if (!data) {
        throw new Error('Impossible de lire les données de ce canal.');
      }

      // Construction du message style "Newsletter" du sanctuaire
      const newsletterText = 
        `*╭╼━━━≪• ɪɴғᴏs ᴅᴜ ᴄᴀɴᴀʟ •≫━━━╾╮*\n\n` +
        `*📢 ɴᴏᴍ :* ${data.name || 'ɪɴᴄᴏɴɴᴜ'}\n` +
        `*👥 ᴀʙᴏɴɴᴇ́s :* ${data.subscribers || 'ᴄᴀᴄʜᴇ́'}\n` +
        `*🔗 ʟɪᴇɴ :* ${channelLink}\n\n` +
        `*📝 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n${data.description || 'ᴀᴜᴄᴜɴᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ'}\n\n` +
        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      // Si Baileys trouve l'URL de la photo de profil du canal
      const profilePic = data.picture || data.preview;

      if (profilePic) {
        // Envoi de l'image avec la légende
        await sock.sendMessage(chatId, {
          image: { url: profilePic },
          caption: newsletterText
        }, { quoted: msg });
      } else {
        // Sinon, on envoie simplement le texte
        await reply(newsletterText);
      }

    } catch (error) {
      console.error('Error in channel command:', error);
      await reply(`*〆 ʟ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ :* ʟᴇs ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ sᴏɴᴛ ɪɴᴀᴄᴄᴇssɪʙʟᴇs.`);
    }
  }
};
