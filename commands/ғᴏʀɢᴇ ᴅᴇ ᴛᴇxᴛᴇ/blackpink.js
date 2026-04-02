/**
 * Blackpink Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'blackpink',
  aliases: [],
  category: '‎✎ ғᴏʀɢᴇ ᴅᴇ ᴛᴇxᴛᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄʀᴇ́ᴇ ᴜɴ ᴇғғᴇᴛ ᴅᴇ ᴛᴇxᴛᴇ sᴛʏʟᴇ ʙʟᴀᴄᴋᴘɪɴᴋ',
  usage: `${prefix}blackpink <ᴛᴇxᴛᴇ>`,

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      if (!text) {
        return await sock.sendMessage(chatId, { 
          text: `*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ᴛᴇxᴛᴇ !*\n\n*ᴇxᴇᴍᴘʟᴇ : _${prefix}blackpink Jésus-Christ_*` 
        }, { quoted: msg });
      }

      const result = await mumaker.ephoto('https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html', text);

      if (!result || !result.image) {
        throw new Error('Aucune URL d\'image reçue de l\'API');
      }

      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      }, { quoted: msg });

    } catch (error) {
      console.error('Error in blackpink command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `*〆 ᴇ́ᴄʜᴇᴄ ᴅ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
