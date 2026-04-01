/**
 * Bible Command - GhostG-X Edition
 * Option 1 : .bible -> Verset au hasard (depuis ton JSON local parfait)
 * Option 2 : .bible jean 3:16 -> Recherche en direct en Français !
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Fonction pour convertir du texte normal en Small Caps GhostG-X
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'bible',
  aliases: ['ecritures', 'verset', 'saint', 'ᴇᴄʀɪᴛᴜʀᴇs'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: 'Génère un verset aléatoire ou recherche un verset spécifique en Français.',
  usage: '.bible [livre chapitre:verset]',
  
  async execute(sock, msg, args, extra) {
    try {
      const prefix = extra.prefix || '.';
      
      // ==========================================
      // OPTION 2 : L'utilisateur fait une recherche
      // ==========================================
      if (args.length > 0) {
        await extra.reply(`⏳ *ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴇ́ᴄʀɪᴛᴜʀᴇs sᴀɪɴᴛᴇs...*`);
        
        const query = args.join(' ');
        
        try {
          // Utilisation d'une API universelle propre spécifiant la version LSG (Louis Segond - Français)
          const response = await axios.get(`https://bible-api.com/${encodeURIComponent(query)}?translation=lsg`);
          
          if (!response.data || !response.data.text) {
             throw new Error("Verset introuvable");
          }
          
          const textBrut = response.data.text.trim();
          const referenceBrute = response.data.reference;
          
          // Conversion du texte et de la référence en style GhostG-X
          const textStyle = toSmallCaps(textBrut.toLowerCase());
          const refStyle = toSmallCaps(referenceBrute.toLowerCase());
          
          let responseMsg = `╭╼━≪• *sᴀɪɴᴛᴇs_ᴇ́ᴄʀɪᴛᴜʀᴇs* •≫━╾╮\n` +
                            `┃ *ʀᴇᴄʜᴇʀᴄʜᴇ* : ${toSmallCaps(query)}\n` +
                            `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                            `📖 *${textStyle}*\n\n` +
                            `📜 *${refStyle}* (ᴠᴇʀsɪᴏɴ ɢʜᴏsᴛɢ-𝐗)\n\n` +
                            `*_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_❤️*\n` +
                            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                            
          return await sock.sendMessage(msg.key.remoteJid, { text: responseMsg }, { quoted: msg });
          
        } catch (apiError) {
          return await extra.reply(`❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴛʀᴏᴜᴠᴇʀ ᴄᴇ ᴠᴇʀsᴇᴛ. ᴠᴇ́ʀɪғɪᴇ ʟ'ᴏʀᴛʜᴏɢʀᴀᴘʜᴇ (ᴇx : ᴊᴇᴀɴ 3:16).*`);
        }
      }

      // ==========================================
      // OPTION 1 : Verset au hasard (JSON Local)
      // ==========================================
      const jsonPath = path.join(__dirname, 'bible.json');

      if (!fs.existsSync(jsonPath)) {
        return await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴅᴇs sᴀɪɴᴛᴇs ᴇ́ᴄʀɪᴛᴜʀᴇs (ʙɪʙʟᴇ.ᴊsᴏɴ) ᴇsᴛ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ.*`);
      }

      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const verses = JSON.parse(rawData);

      if (!Array.isArray(verses) || verses.length === 0) {
        return await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴇsᴛ ᴠɪᴅᴇ.*`);
      }

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      await sock.sendMessage(msg.key.remoteJid, {
        text: `╭╼━≪• *sᴀɪɴᴛᴇs_ᴇ́ᴄʀɪᴛᴜʀᴇs* •≫━╾╮\n` +
              `┃ *ᴍᴏᴅᴇ* : ᴀʟᴇ́ᴀᴛᴏɪʀᴇ\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `${randomVerse}\n\n` +
              `*_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_❤️*\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });

    } catch (error) {
      console.error('Bible Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ sᴘᴇᴄᴛʀᴀʟᴇ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};
