/**
 * TTS - Text to Speech Command
 * GhostG-X Edition
 */

const axios = require('axios'); 
const APIs = require('../../utils/api');
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
  name: 'tts',
  aliases: ['speak', 'say', 'murmure'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴠᴏɪx ᴘᴏᴜʀ ᴘʀᴏɴᴏɴᴄᴇʀ ᴠᴏs ᴍᴜʀᴍᴜʀᴇs (ᴛᴛs)**',
  usage: `${config.prefix || '.'}tts [texte ou en reponse]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = extra.from;

    try {
      let text = args.join(' ');

      // Extraction propre et isolée du texte cité avant toute autre action
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!text && ctx?.quotedMessage) {
        const quoted = ctx.quotedMessage;
        text = quoted.conversation || 
               quoted.extendedTextMessage?.text || 
               quoted.imageMessage?.caption || 
               quoted.videoMessage?.caption || 
               '';
      }

      const prefix = config.prefix || '.';

      // Validation si aucun texte n'est extrait
      if (!text || text.trim() === '') {
        return await reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('indique un murmure a materialiser')} !*\n` +
          `┃ 💡 *${toSmallCaps('exemple')} :* ${prefix}tts ${toSmallCaps('bonjour le sanctuaire')}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        ); 
      }

      // Message d'attente d'invocation (Optionnel : tu peux le retirer si tu préfères que ce soit instantané)
      await reply(`*🔮 ${toSmallCaps('materialisation de la voix en cours')}...*`);

      // Appel à ton utilitaire API
      const audioUrl = await APIs.textToSpeech(text);

      let audioBuffer;
      if (Buffer.isBuffer(audioUrl)) {
        audioBuffer = audioUrl;
      } else {
        const audioResponse = await axios.get(audioUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        audioBuffer = Buffer.from(audioResponse.data);
      }

      // Envoi du message sous forme de note vocale (PTT)
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/ogg; codecs=opus', 
        ptt: true 
      }, { quoted: msg });

    } catch (error) {
      console.error('TTS command error:', error);
      await reply(
        `╭╼━≪• *❌ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪʟʟᴜsɪᴏɴ* •≫━╾╮\n` +
        `┃\n` +
        `┃ 🥀 *${toSmallCaps('limpossible s est produit')}...*\n` +
        `┃ ⚠️ *${toSmallCaps('erreur')} :* ${error.message}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
      );
    }
  }
};
