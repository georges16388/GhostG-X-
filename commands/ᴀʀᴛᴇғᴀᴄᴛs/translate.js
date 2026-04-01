/**
 * Translate Command - GhostG-X Edition
 * Traduit des textes dans le sanctuaire
 */

const fetch = require('node-fetch');
const config = require('../../config.js'); // Ajout de l'import de la config

module.exports = {
  name: 'ᴏʀᴀᴄʟᴇ',
  aliases: ['oracles', 'translate', 'trt', 'tr', 'traduis','traduire'],
  category: '⚒ ᴀʀᴛᴇғᴀᴄᴛs',
  description: 'ᴛʀᴀᴅᴜɪᴛ ᴅᴇs ᴛᴇxᴛᴇs ᴇᴛ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅᴀɴs ᴅ\'ᴀᴜᴛʀᴇs ʟᴀɴɢᴜᴇs',
  
  // Utilisation de get usage() pour le préfixe dynamique
  get usage() {
    const activePrefix = config.prefix || '.';
    return `${activePrefix}ᴏʀᴀᴄʟᴇ <ᴛᴇxᴛᴇ> <ʟᴀɴɢ> ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ : ${activePrefix}ᴏʀᴀᴄʟᴇ <ʟᴀɴɢ>`;
  },

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;
      const activePrefix = config.prefix || '.'; // Récupération du préfixe pour les messages

      // Affichage de l'indicateur d'écriture
      await sock.sendPresenceUpdate('composing', chatId);

      let textToTranslate = '';
      let lang = '';

      // Vérification si le message est une réponse (citation)
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quotedMessage) {
        // Extraction du texte cité
        textToTranslate = quotedMessage.conversation || 
                         quotedMessage.extendedTextMessage?.text || 
                         quotedMessage.imageMessage?.caption || 
                         quotedMessage.videoMessage?.caption || 
                         '';

        // Extraction de la langue depuis les arguments
        lang = args.join(' ').trim();
      } else {
        // Analyse des arguments pour un message direct
        if (args.length < 2) {
          return await sock.sendMessage(chatId, {
            text: `*╭╼━━━≪• ᴏʀᴀᴄʟᴇ ᴅᴇs ʟᴀɴɢᴜᴇs •≫━━━╾╮*\n` +
            `*☬ ᴜsᴀɢᴇ :*\n` +
            `*1. ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀᴠᴇᴄ : ${activePrefix}ᴏʀᴀᴄʟᴇ <ʟᴀɴɢ>*\n` +
            `*2. ᴏᴜ ᴛᴀᴘᴇ : ${activePrefix}ᴏʀᴀᴄʟᴇ <ᴛᴇxᴛᴇ> <ʟᴀɴɢ>*\n\n` +
            `*📜 ᴇxᴇᴍᴘʟᴇ :*\n` +
            `*${activePrefix}ᴏʀᴀᴄʟᴇ ʜᴇʟʟᴏ ғʀ*\n\n` +
            `*🔮 ᴄᴏᴅᴇs ᴅᴇs ʟᴀɴɢᴜᴇs :*\n` +
            `*ғʀ - ғʀᴇɴᴄʜ, ᴇs - sᴘᴀɴɪsʜ, ᴅᴇ - ɢᴇʀᴍᴀɴ, ɪᴛ - ɪᴛᴀʟɪᴀɴ*\n` +
            `*ᴘᴛ - ᴘᴏʀᴛᴜɢᴜᴇsᴇ, ʀᴜ - ʀᴜssɪᴀɴ, ᴊᴀ - ᴊᴀᴘᴀɴᴇsᴇ, ᴋᴏ - ᴋᴏʀᴇᴀɴ*\n` +
            `*ᴢʜ - ᴄʜɪɴᴇsᴇ, ᴀʀ - ᴀʀᴀʙɪᴄ, ʜɪ - ʜɪɴᴅɪ*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          }, { quoted: msg });
        }

        lang = args.pop(); // Récupère le code de la langue
        textToTranslate = args.join(' '); // Récupère le texte à traduire
      }

      if (!textToTranslate) {
        return await sock.sendMessage(chatId, { 
          text: '*〆 ᴀᴜᴄᴜɴ ᴛᴇxᴛᴇ ᴛʀᴏᴜᴠᴇ́ ᴀ̀ ᴛʀᴀᴅᴜɪʀᴇ ! ᴇ́ᴄʀɪs ᴜɴ ᴍᴇssᴀɢᴇ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ.*' 
        }, { quoted: msg });
      }

      if (!lang) {
        return await sock.sendMessage(chatId, { 
          text: `*〆 ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇ́ᴄɪғɪᴇʀ ᴜɴ ᴄᴏᴅᴇ ᴅᴇ ʟᴀɴɢᴜᴇ.*\n\n*ᴇxᴇᴍᴘʟᴇ : ${activePrefix}ᴏʀᴀᴄʟᴇ ʜᴇʟʟᴏ ғʀ*` 
        }, { quoted: msg });
      }

      let translatedText = null;

      // Tentative avec l'API 1 (Google Translate API)
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0][0] && data[0][0][0]) {
            translatedText = data[0][0][0];
          }
        }
      } catch (e) {
        // Poursuite vers l'API suivante en cas d'échec
      }

      // Si l'API 1 échoue, tentative avec l'API 2
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
              translatedText = data.responseData.translatedText;
            }
          }
        } catch (e) {
          // Poursuite vers l'API suivante en cas d'échec
        }
      }

      // Si l'API 2 échoue, tentative avec l'API 3
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.translated) {
              translatedText = data.translated;
            }
          }
        } catch (e) {
          // Toutes les API ont échoué
        }
      }

      if (!translatedText) {
        return await sock.sendMessage(chatId, { 
          text: '*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴛʀᴀᴅᴜɪʀᴇ ᴄᴇ ᴛᴇxᴛᴇ. ʀᴇ́ᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.*' 
        }, { quoted: msg });
      }

      // Envoi de la traduction brute comme dans ton code initial
      await sock.sendMessage(chatId, {
        text: `${translatedText}`
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ Error in translate command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: '*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴛʀᴀᴅᴜɪʀᴇ ᴄᴇ ᴛᴇxᴛᴇ. ʀᴇ́ᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.*' 
      }, { quoted: msg });
    }
  }
};
