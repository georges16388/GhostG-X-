/**
 * Weather Command - AGM Meteo-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

// --- FONCTION DE DESIGN AGM (WEATHER STYLE) ---
const AGM_WEATHER = (city, temp, desc, feel, hum, wind) => `╭╼━≪• *ᴀɢᴍ ᴍᴇᴛᴇᴏ ᴄᴏʀᴇ* •≫━╾╮
┃ *ᴄɪᴛʏ* : ${city} 📍
┃ *ꜱᴛᴀᴛᴜꜱ* : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ *ᴛᴇᴍᴘ* : ${temp}°C 🌡️
┃ *ꜰᴇᴇʟꜱ* : ${feel}°C 🤔
┃ *ʜᴜᴍɪᴅɪᴛʏ* : ${hum}% 💧
┃ *ᴡɪɴᴅ* : ${wind} ᴋᴍ/ʜ 💨
┃ *ᴅᴇꜱᴄ* : ${desc} ✨
╰━━━━━━━━━━━━━━━╯
 > *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'weather',
  aliases: ['w', 'clima', 'meteo'],
  category: 'utility',
  description: 'Obtenir les informations météo d\'une ville',
  usage: '.weather <ville>',
  
  async execute(sock, msg, args, extra) {
    try {
      const city = args.join(' ');
      const chatId = extra.from;
      const apiKey = '4902c0f2550f58298ad4146a92b65e10';
      
      if (!city) {
        return await extra.reply('⚠️ *ᴜꜱᴀɢᴇ :* .ᴡᴇᴀᴛʜᴇʀ <ᴠɪʟʟᴇ>\n*ᴇxᴇᴍᴘʟᴇ :* .ᴡᴇᴀᴛʜᴇʀ ᴘᴀʀɪꜱ');
      }

      // Réaction satellite
      await sock.sendMessage(chatId, { react: { text: '🛰️', key: msg.key } });

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;
      const response = await axios.get(url);
      const w = response.data;
      
      // Extraction des données
      const temp = Math.round(w.main.temp);
      const feel = Math.round(w.main.feels_like);
      const desc = w.weather[0].description;
      const hum = w.main.humidity;
      const wind = Math.round(w.wind.speed * 3.6); // Conversion m/s en km/h

      await sock.sendMessage(chatId, {
        text: AGM_WEATHER(w.name, temp, desc, feel, hum, wind)
      }, { quoted: msg });

      // Réaction selon le climat
      const reactEmoji = temp > 25 ? '☀️' : temp < 10 ? '❄️' : '🌤️';
      await sock.sendMessage(chatId, { react: { text: reactEmoji, key: msg.key } });

    } catch (error) {
      console.error('Error fetching weather:', error);
      const errorMsg = error.response?.status === 404 
        ? "❌ *ᴠɪʟʟᴇ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ.*" 
        : "❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴɴᴇxɪᴏɴ ᴀᴜ sᴀᴛᴇʟʟɪᴛᴇ.*";
      await extra.reply(errorMsg);
    }
  }
};
