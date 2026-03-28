/**
 * TTS - AGM Vocal Edition
 * Style & Design by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
// Assure-toi que ton utilitaire API est bien configuré
const APIs = require('../../utils/api');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- DESIGN AGM POUR CONFIRMATION ---
const AGM_DESIGN = (text) => {
  const shortText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  return `╭╼━≪• *ɢʜᴏsᴛ ᴠᴏᴄᴀʟ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('sᴘᴇᴀᴋɪɴɢ')}
┃ ${toSmallCaps('ᴛᴇxᴛ')} : ${toSmallCaps(shortText)}
┃ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps('ᴛᴛs-ɴᴏᴠᴀ')} ⚡
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say', 'vocal'],
  category: 'essentials',
  description: 'Convertir un texte en message vocal',
  usage: '.tts <texte>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ').trim();

      if (!text) {
        const warning = toSmallCaps("veuillez specifier un texte a vocaliser");
        return extra.reply(`⚠️ *${warning}*`);
      }

      // 1. Réaction de préparation
      await sock.sendMessage(chatId, { react: { text: "🎙️", key: msg.key } });

      // 2. Conversion texte → audio via ton API
      // Note : Assure-toi que APIs.textToSpeech renvoie bien un lien direct vers l'audio
      const audioUrl = await APIs.textToSpeech(text);

      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      const audioBuffer = Buffer.from(audioResponse.data);

      // 3. Envoi du message vocal (PTT : Push To Talk)
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mp4', // Format standard pour les vocaux WhatsApp
        ptt: true
      }, { quoted: msg });

      // 4. Envoi du cadre de confirmation stylisé
      await sock.sendMessage(chatId, { 
        text: AGM_DESIGN(text) 
      }, { quoted: msg });

    } catch (error) {
      console.error('TTS command error:', error);
      const errorMsg = toSmallCaps("echec de la generation vocale");
      await extra.reply(`❌ *${errorMsg}*`);
    }
  }
};
