/**
 * Weather Command - Get weather information using OpenWeather API
 */

const axios = require('axios');

module.exports = {
  name: 'ᴍᴇᴛᴇᴏ',
  aliases: ['meteo', 'weather', 'w', 'clima'],
  category: '⚒ ᴀʀᴛᴇғᴀᴄᴛs',
  description: 'ʀᴇ́ᴠᴇ̀ʟᴇ ʟᴇs ᴄᴏɴᴅɪᴛɪᴏɴs ᴄᴇ́ʟᴇsᴛᴇs ᴅ\'ᴜɴᴇ ᴄɪᴛᴇ́',
  usage: '.ᴏʀᴀᴄʟᴇ_ᴍᴇᴛᴇᴏ <ᴠɪʟʟᴇ>',
  
  async execute(sock, msg, args) {
    try {
      if (args.length === 0) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: '*〆 ᴜsᴀɢᴇ : .ᴏʀᴀᴄʟᴇ_ᴍᴇᴛᴇᴏ <ᴠɪʟʟᴇ>*\n\n*ᴇxᴇᴍᴘʟᴇ : .ᴏʀᴀᴄʟᴇ_ᴍᴇᴛᴇᴏ ʟᴏɴᴅᴏɴ*' 
        }, { quoted: msg });
      }
      
      const city = args.join(' ');
      const apiKey = '4902c0f2550f58298ad4146a92b65e10';
      
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      const weather = response.data;
      
      const weatherText = `*╭╼━━━≪• ᴀᴜʀᴀ ᴄᴇ́ʟᴇsᴛᴇ •≫━━━╾╮*\n` +
                          `*┃ 🔮 ᴄɪᴛᴇ́ : ${weather.name}*\n` +
                          `*┃ 📜 ᴇ́ᴛᴀᴛ : ${weather.weather[0].description}*\n` +
                          `*┃ 🌡️ ᴛᴇᴍᴘᴇ́ʀᴀᴛᴜʀᴇ : ${weather.main.temp}°C*\n` +
                          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;
      
      await sock.sendMessage(msg.key.remoteJid, { text: weatherText }, { quoted: msg });
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: '*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ sᴏɴᴅᴇʀ ʟᴇs ᴄɪᴇᴜx ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄɪᴛᴇ́.*' 
      }, { quoted: msg });
    }
  }
};
