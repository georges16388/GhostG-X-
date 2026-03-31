/**
 * Aveu Command - GhostG-X Edition
 * Récupère une question de vérité aléatoire et la traduit en français
 */

const { truth } = require('@bochilteam/scraper');
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    name: 'ᴀᴠᴇᴜ',
    aliases: ['aveu', 'truth', 'verite', 'confession'],
    category: '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
    desc: 'ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ sᴇɴᴛᴇɴᴄᴇ ᴅᴇ ᴠᴇ́ʀɪᴛᴇ́ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴘᴏᴜʀ ᴜɴ ᴍᴇᴍʙʀᴇ',
    usage: 'ᴀᴠᴇᴜ',
    
    execute: async (sock, msg, args, extra) => {
      try {
        const question = await truth();
        
        // Traduction directe en français pour le sanctuaire
        const res = await translate(question, { to: 'fr' });
        
        // Construction du message stylisé
        const finalMessage = `*╭╼━━━≪• ʟ'ᴀᴜᴅɪᴇɴᴄᴇ ᴅᴇ ʟ'ᴀᴠᴇᴜ •≫━━━╾╮*\n` +
                             `*┃ 📜 ᴛᴀ sᴇɴᴛᴇɴᴄᴇ :*\n` +
                             `*┃ ${res.text}*\n` +
                             `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                             `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await extra.reply(finalMessage);
        
      } catch (error) {
        console.error('Truth (Aveu) Error:', error);
        await extra.reply(`*〆 ʟ'ᴇxᴘɪᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ʟ'ᴏʀᴀᴄʟᴇ ʀᴇsᴛᴇ ᴍᴜᴇᴛ.*`);
      }
    }
  };
  