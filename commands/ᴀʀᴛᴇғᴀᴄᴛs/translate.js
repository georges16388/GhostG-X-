/**
 * Translate Command - GhostG-X Edition
 * Traduit des textes dans le sanctuaire (Mode Brut)
 */

const fetch = require('node-fetch');
const config = require('../../config.js');

function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  const cleanedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'translate',
  aliases: ['tr', 'trans', 'trad', 'traduis', 'traduire'], 
  category: '⚒ ᴀʀᴛᴇғᴀᴄᴛs',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀᴅᴜɪᴛ ᴅᴇs ᴛᴇxᴛᴇs ᴇᴛ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs (ᴍᴏᴅᴇ ʙʀᴜᴛ)',

  get usage() {
    const activePrefix = config.prefix || '.';
    return `${activePrefix}oracle <lang> <texte> ou en reponse : ${activePrefix}oracle <lang>`;
  },

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    try {
      const chatId = msg.key.remoteJid;
      const activePrefix = config.prefix || '.';
      await sock.sendPresenceUpdate('composing', chatId);

      let textToTranslate = '';
      let lang = '';
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quotedMessage) {
        textToTranslate = quotedMessage.conversation || 
                         quotedMessage.extendedTextMessage?.text || 
                         quotedMessage.imageMessage?.caption || 
                         quotedMessage.videoMessage?.caption || '';
        lang = args[0]?.toLowerCase().trim();
      } else {
        if (args.length < 2) {
          return await reply(
            `*⚠️ ${toSmallCaps('usage')} :*\n` +
            `*1. ${toSmallCaps('reponds a un message avec')} : ${activePrefix}oracle <ʟᴀɴɢ>*\n` +
            `*2. ${toSmallCaps('ou tape')} : ${activePrefix}oracle <ʟᴀɴɢ> <ᴛᴇxᴛᴇ>*\n\n` +
            `*📜 ${toSmallCaps('exemple')} : ${activePrefix}oracle fr hello*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        }
        lang = args[0].toLowerCase();
        textToTranslate = args.slice(1).join(' ');
      }

      if (!textToTranslate || !lang) {
        return await reply(`*❌ ${toSmallCaps('aucun texte ou langue detecte')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      let translatedText = null;

      // API 1
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.[0]?.[0]?.[0]) translatedText = data[0][0][0];
        }
      } catch (e) {}

      // API 2
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data?.responseData?.translatedText) translatedText = data.responseData.translatedText;
          }
        } catch (e) {}
      }

      if (!translatedText) {
        return await reply(`*❌ ${toSmallCaps('l oracle a echoue a traduire ce texte')}...*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      await reply(`${translatedText}`);

    } catch (error) {
      console.error('Error in translate command:', error);
      await reply(`*❌ ${toSmallCaps('l oracle a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
