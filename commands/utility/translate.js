/**
 * Translate Command - AGM Universal
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fetch = require('node-fetch');

// --- FONCTION DE DESIGN AGM (TRANSLATE STYLE) ---
const AGM_TR = (text, lang) => `╭╼━≪• * ɢʜᴏsᴛɢ-𝐗 ᴛʀᴀɴꜱʟᴀᴛᴏʀ* •≫━╾╮
┃ *ᴛᴏ ʟᴀɴɢ* : ${lang.toUpperCase()} 🌐
┃ *ᴛᴇxᴛ* : ${text}
┃ *ꜱᴛᴀᴛᴜꜱ* : 🟢 ᴛʀᴀɴꜱʟᴀᴛᴇᴅ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'translate',
  aliases: ['trt', 'tr'],
  category: 'utility',
  description: 'Traduire du texte dans différentes langues',
  usage: '.tr <lang> (en répondant) ou .tr <texte> <lang>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      let textToTranslate = '';
      let lang = '';
      
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quoted) {
        textToTranslate = quoted.conversation || 
                         quoted.extendedTextMessage?.text || 
                         quoted.imageMessage?.caption || 
                         '';
        lang = args[0] || 'fr'; // Par défaut en français si non spécifié
      } else {
        if (args.length < 2) {
          return await extra.reply(`╭╼━≪• *ᴀɢᴍ ᴛʀᴀɴꜱʟᴀᴛᴏʀ* •≫━╾╮
┃ *ᴜꜱᴀɢᴇ* : .ᴛʀ <ᴛᴇxᴛᴇ> <ʟᴀɴɢ>
┃ *ᴇxᴇᴍᴘʟᴇ* : .ᴛʀ ʜᴇʟʟᴏ ꜰʀ
╰━━━━━━━━━━━━━━━╯
*ᴄᴏᴅᴇꜱ :* ꜰʀ, ᴇɴ, ᴇꜱ, ᴀʀ, ᴊᴀ, ʀᴜ...`);
        }
        lang = args.pop(); 
        textToTranslate = args.join(' ');
      }

      await sock.sendMessage(chatId, { react: { text: '🔠', key: msg.key } });

      let translatedText = null;
      
      // API 1: Google Translate
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        const data = await res.json();
        translatedText = data?.[0]?.[0]?.[0];
      } catch (e) {}

      // API 2: MyMemory (Backup)
      if (!translatedText) {
        try {
          const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          const data = await res.json();
          translatedText = data?.responseData?.translatedText;
        } catch (e) {}
      }

      if (!translatedText) throw new Error('ᴛʀᴀɴꜱʟᴀᴛɪᴏɴ_ꜰᴀɪʟᴇᴅ');

      await sock.sendMessage(chatId, {
        text: AGM_TR(translatedText, lang)
      }, { quoted: msg });

    } catch (error) {
      console.error('Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴛʀᴀᴅᴜᴄᴛɪᴏɴ*`);
    }
  }
};
