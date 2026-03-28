/**
 * TTS - GhostG-X MD Vocal Edition
 * Style & Design by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized with Google TTS Engine
 */

const axios = require('axios');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- DESIGN AGM PRESTIGE (FULL GRAS) ---
const AGM_DESIGN = (text) => {
  const styledText = toStyledCaps(text.length > 25 ? text.substring(0, 22) + '...' : text);
  return `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ᴠᴏᴄᴀʟ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('sᴘᴇᴀᴋɪɴɢ')}*
*┃* 📝 *${toStyledCaps('ᴛᴇxᴛ')}* : *${styledText}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ᴛᴛs-ɴᴏᴠᴀ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say', 'vocal'],
  category: 'essentials',
  description: 'Convertir un texte en message vocal (Français par défaut).',
  usage: '.tts <texte>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ').trim();

      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇᴄɪғɪᴇʀ ᴜɴ ᴛᴇxᴛᴇ ᴀ ᴠᴏᴄᴀʟɪsᴇʀ")}*`);
      }

      // 1. Réaction de préparation
      await sock.sendMessage(chatId, { react: { text: "🎙️", key: msg.key } });

      // 2. Utilisation de Google TTS (Plus stable que les APIs tierces)
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;

      const response = await axios.get(googleTtsUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const audioBuffer = Buffer.from(response.data);

      // 3. Envoi du message vocal (PTT : Push To Talk)
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: msg });

      // 4. Envoi du cadre de confirmation stylisé
      await sock.sendMessage(chatId, { 
        text: AGM_DESIGN(text) 
      }, { quoted: msg });

      // 5. Réaction de succès
      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('TTS GLOBAL ERROR:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ɢᴇɴᴇʀᴀᴛɪᴏɴ ᴠᴏᴄᴀʟᴇ")}*`);
    }
  }
};
