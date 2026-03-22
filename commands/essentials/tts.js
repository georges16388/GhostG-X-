/**
 * TTS - AGM Vocal Edition
 * Style & Design by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');
const axios = require('axios');

// --- DESIGN AGM POUR CONFIRMATION ---
const AGM_DESIGN = (text) => {
  const displayText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  return `╭╼━≪• ᴠᴏᴄᴀʟ ɢᴇɴᴇʀᴀᴛᴏʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 sᴘᴇᴀᴋɪɴɢ
┃ ᴛᴇxᴛ : ${displayText}
┃ ᴍᴏᴅᴇ : ᴛᴛs-ɴᴏᴠᴀ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ-𝐗`;
};

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say'],
  category: 'essentials',
  description: 'Convert text to speech (Voice Message)',
  usage: '.tts <text>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ').trim();

      if (!text) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ sᴘéᴄɪғɪᴇʀ ᴜɴ ᴛᴇxᴛᴇ à ᴠᴏᴄᴀʟɪsᴇʀ.*');
      }

      // Réaction de chargement
      await sock.sendMessage(chatId, { react: { text: "🎙️", key: msg.key } });

      // Conversion texte → audio
      const audioUrl = await APIs.textToSpeech(text);

      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      const audioBuffer = Buffer.from(audioResponse.data);

      // Envoi du message vocal
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mp3',
        ptt: true
      }, { quoted: msg });

      // Envoi du cadre AGM en confirmation
      await extra.reply(AGM_DESIGN(text));

    } catch (error) {
      console.error('TTS command error:', error);
      await extra.reply('❌ *éᴄʜᴇᴄ ᴅᴇ ʟᴀ ɢéɴéʀᴀᴛɪᴏɴ ᴠᴏᴄᴀʟᴇ.*');
    }
  }
};