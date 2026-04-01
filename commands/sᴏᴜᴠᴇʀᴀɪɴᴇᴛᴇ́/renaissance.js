/**
 * Restart Command - GhostG-X Edition
 * Réinitialise et ressuscite l'Oracle
 */

const { exec } = require('child_process');
const config = require('../../config.js'); 

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ʀᴇɴᴀɪssᴀɴᴄᴇ',
  aliases: ['renaissance', 'reboot', 'reload', 'restart', 'resurrection'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, 
  description: `**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇғᴏʀɢᴇ ᴇᴛ ʀᴇssᴜsᴄɪᴛᴇ ʟᴇ ʟ'ᴏʀᴀᴄʟᴇ**`,
  usage: `${prefix}ʀᴇɴᴀɪssᴀɴᴄᴇ`,

  async execute(sock, msg, args, extra) {
    const { isOwner, reply, from } = extra;

    try {
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      await reply(`*🐦‍🔥 ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ ᴅᴜ ʀɪᴛᴜᴇʟ ᴅᴇ ʀᴇɴᴀɪssᴀɴᴄᴇ...*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

      // 🔥 LE FIX : On dit à WhatsApp qu'on a lu le message pour qu'il ne le renvoie pas au redémarrage
      try {
        await sock.readMessages([msg.key]);
      } catch (e) {
        console.log("Impossible de marquer le message comme lu, on continue...");
      }

      const run = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
          });
        });

      try {
        await run('pm2 restart all');
        return;
      } catch (e) {
        console.log('PM2 non disponible, repli sur process.exit(0)');
      }

      // 🔥 DEUXIÈME SÉCURITÉ : On attend 2 secondes (2000 ms) pour laisser le temps 
      // au bot d'envoyer les paquets de lecture à WhatsApp avant de couper le moteur !
      setTimeout(() => {
        process.exit(0);
      }, 2000);

    } catch (error) {
      console.error('Restart error:', error);
      await reply(`*〆 ʟᴀ ʀᴇɴᴀɪssᴀɴᴄᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  },
};
