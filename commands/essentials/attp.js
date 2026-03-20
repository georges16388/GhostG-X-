/**
 * ATTP - Animated Text to Picture Sticker
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const { spawn } = require('child_process');
const { writeExifVid } = require('../../utils/exif');

module.exports = {
  name: 'attp',
  aliases: ['ttp', 'sante'],
  category: 'essentials',
  description: 'Crée un sticker animé à partir d\'un texte.',
  usage: '<texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(`╭╼━≪• ɢʜᴏsᴛ ᴀᴛᴛᴘ •≫━╾╮\n┃ ᴜsᴀɢᴇ : ${extra.prefix || '.'}ᴀᴛᴛᴘ <ᴛᴇxᴛᴇ>\n┃ ᴇx : ${extra.prefix || '.'}ᴀᴛᴛᴘ ɢʜᴏsᴛ ᴀɪ\n╰━━━━━━━━━━━━━━━╯`);
      }
      
      const text = args.join(' ');
      if (text.length > 50) {
        return extra.reply('⚠️ *Texte trop long !* (Max 50 caractères)');
      }

      // Réaction de chargement "technique"
      await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });
      
      try {
        // Rendu de la vidéo avec couleurs Ghost (Cyan, Magenta, Gold)
        const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
        
        // Injection des métadonnées personnalisées -ɢʜᴏsᴛɢ 𝐗
        const webpBuffer = await writeExifVid(mp4Buffer, { 
            packname: '-ɢʜᴏsᴛɢ 𝐗', 
            author: 'Ghost AI 🤖' 
        });

        await sock.sendMessage(extra.from, { sticker: webpBuffer }, { quoted: msg });
        
      } catch (error) {
        console.error('Error generating attp sticker:', error);
        await extra.reply('❌ Échec de la génération du sticker.');
      }
    } catch (error) {
      console.error('ATTP command error:', error);
      await extra.reply('❌ Une erreur est survenue !');
    }
  }
};

function renderBlinkingVideoWithFfmpeg(text) {
  return new Promise((resolve, reject) => {
    // Détection automatique du chemin de la police
    const fontPath = process.platform === 'win32'
      ? 'C:/Windows/Fonts/arialbd.ttf'
