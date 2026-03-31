/**
 * Restart Command - GhostG-X Edition
 * Réinitialise et ressuscite le bot
 */

const { exec } = require('child_process');
const config = require('../../config'); // Importation de la configuration .env

module.exports = {
  name: 'ʀᴇɴᴀɪssᴀɴᴄᴇ',
  aliases: ['renaissance', 'reboot', 'reload', 'restart', 'resurrection'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ʀᴇғᴏʀɢᴇ ᴇᴛ ʀᴇssᴜsᴄɪᴛᴇ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ (ᴏᴡɴᴇʀ ᴜɴɪǫᴜᴇᴍᴇɴᴛ)',
  usage: '.ʀᴇɴᴀɪssᴀɴᴄᴇ',
  ownerOnly: true, // Baileys et ton handler bloquent déjà l'accès aux non-owners ici

  async execute(sock, msg, args, extra) {
    const { isOwner, reply } = extra;
    
    try {
      // 1. SÉCURITÉ : Vérification que l'utilisateur est bien listé comme Owner
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      await reply(`*🐦‍🔥 ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ ᴅᴜ ʀɪᴛᴜᴇʟ ᴅᴇ ʀᴇɴᴀɪssᴀɴᴄᴇ...*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

      const run = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
          });
        });

      try {
        // Si ton bot tourne sous PM2 (VPS), cela va forcer son rechargement
        await run('pm2 restart all');
        return;
      } catch (e) {
        // PM2 n'est pas utilisé (cas classique sur Heroku, Koyeb, ou en local)
        console.log('PM2 non disponible, repli sur process.exit(0)');
      }

      // L'arrêt propre du processus. 
      // Le panel d'hébergement (Heroku, Docker, Nodemon) recréera le processus instantanément.
      setTimeout(() => {
        process.exit(0);
      }, 500);
      
    } catch (error) {
      console.error('Restart error:', error);
      await reply(`*〆 ʟᴀ ʀᴇɴᴀɪssᴀɴᴄᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  },
};
