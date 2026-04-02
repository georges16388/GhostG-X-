/**
 * Xvideo Command - The Discipline Trap
 * GhostG-X Edition
 */

const fs = require('fs');
const path = require('path');
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

const prefix = config.prefix || '.';

module.exports = {
  name: 'xvideo',
  aliases: ['porn', 'sex', 'hot', 'xxx', 'hentai'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɢᴇɴᴇʀᴇ ᴜɴᴇ ᴠɪᴅᴇᴏ ᴘᴏʀɴᴏɢʀᴀᴘʜɪǫᴜᴇ ᴘᴏᴜʀ ᴛᴇ ʀᴇᴍᴏɴᴛᴇʀ ʟᴇ ᴍᴏʀᴀʟ',
  usage: `${prefix}xvideo`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { from } = extra;

    try {
      // 1. Sélection aléatoire de la vidéo (1 à 7)
      const randomNum = Math.floor(Math.random() * 7) + 1;
      const videoName = `x_video${randomNum}.mp4`;
      
      // Ajuste le chemin selon ton arborescence vers le dossier utils
      const videoPath = path.join(__dirname, '../../utils', videoName);

      // Vérification si le fichier existe pour éviter un crash
      if (!fs.existsSync(videoPath)) {
        console.error(`[xvideo] Fichier manquant : ${videoPath}`);
        return await sock.sendMessage(from, { 
          text: `*❌ ${toSmallCaps('erreur')} : ${toSmallCaps('l artefact visuel est introuvable dans le sanctuaire')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*` 
        }, { quoted: msg });
      }

      // 2. Liste de messages chocs, bruts et agressifs
      const awakenings = [
        `*ᴛ'ᴀs ᴇᴜ ᴛᴀ ᴅᴏsᴇ ᴅᴇ sᴇxᴇ ᴇᴛ ᴅᴇ ᴘʟᴀɪsɪʀ ᴘᴀɪ̈ᴇɴ ?*\n\n*${toSmallCaps('tu ne merites pas d\'utiliser l\'ultime bot ghostg-𝐗')}. ${toSmallCaps('discipline-toi ou quitte le sanctuaire')}. ${toSmallCaps('ta famille compte sur toi et toi tu cedes a tes pulsions de lache')} !*\n\n*🔱 ${toSmallCaps('deviens une putain de machine')} !*`,
        
        `*ᴀʟᴏʀs, ᴏɴ sᴘᴀᴍᴍᴇ ʟᴇs ᴄᴏᴍᴍᴀɴᴅᴇs ᴘᴏᴜʀ sᴇ ᴘᴏʟɪʀ ʟᴇ sᴄᴇᴘᴛʀᴇ ?*\n\n*${toSmallCaps('tu fais pitie')}. ${toSmallCaps('pendant que tu cherches du plaisir facile devant ton ecran, d\'autres s\'entrainent dur et te depassent')}. ${toSmallCaps('arrete de dilapider ton energie vitale')} !*\n\n*🔥 ${toSmallCaps('un vrai guerrier ne s\'abaisse pas a ca')} !*`,
        
        `*ᴄ'ᴇsᴛ ᴄ̧ᴀ ᴛᴏɴ sᴇᴜʟ ʙᴜᴛ ᴅᴀɴs ʟᴀ ᴠɪᴇ ? ʙᴀᴠᴇʀ ᴅᴇᴠᴀɴᴛ ᴅᴇs ᴘɪxᴇʟs ?*\n\n*${toSmallCaps('david goggins ne s\'assoit pas pour regarder du porno')}. ${toSmallCaps('mets tes putains de baskets et va t\'entrainer')}. ${toSmallCaps('force ton esprit a dominer tes faiblesses')} !*\n\n*🩸 ${toSmallCaps('reprends-toi ou assume ta mediocrite')} !*`,
        
        `*ᴠᴏɪʟᴀ̀ ʟᴀ sᴇᴜʟᴇ ᴠᴇ́ʀɪᴛᴇ́ ǫᴜᴇ ᴛᴜ ᴠᴀs ɪɴɢᴇ́ʀᴇʀ ɪᴄɪ :*\n\n*${toSmallCaps('tu as le cerveau bousille par la luxure')}. ${toSmallCaps('la pornographie detruit ta volonte')}. ${toSmallCaps('un vrai ghost ne plie pas le genou devant ses desirs charnels')} !*\n\n*♟️ ${toSmallCaps('reveille le monstre qui est en toi')} !*`
      ];

      const randomCaption = awakenings[Math.floor(Math.random() * awakenings.length)];

      const finalCaption = `${randomCaption}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      // 3. Envoi de la vidéo choc
      await sock.sendMessage(from, {
        video: fs.readFileSync(videoPath),
        caption: finalCaption,
        mimetype: 'video/mp4'
      }, { quoted: msg });

    } catch (error) {
      console.error('Xvideo Command Error:', error);
      const { reply } = extra;
      if (reply) {
        await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }
    }
  }
};
