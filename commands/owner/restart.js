/**
 * Restart Command - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');

// --- DESIGN AGM ---
const AGM_RESTART = `╭╼━≪• ʀᴇsᴛᴀʀᴛ sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🔄 ʀᴇʙᴏᴏᴛɪɴɢ
┃ sᴄᴏᴘᴇ : ᴀʟʟ ᴍᴏᴅᴜʟᴇs
┃ ᴛɪᴍᴇ : ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' })} ⏰
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reload'],
  category: 'owner',
  description: 'Redémarrer le bot pour appliquer les changements.',
  usage: '.restart',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    try {
      await react('🔄');
      await reply(AGM_RESTART);

      const run = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
          });
        });

      // Attendre un peu pour laisser le temps au message d'être envoyé
      setTimeout(async () => {
        try {
          // Tentative de redémarrage via PM2 (Idéal pour VPS)
          await run('pm2 restart all');
        } catch (e) {
          // Fallback pour les panels (Heroku, Pterodactyl) ou nodemon
          console.log('--- SYSTEM REBOOT VIA PROCESS EXIT ---');
          process.exit(0);
        }
      }, 1000);

    } catch (error) {
      console.error('[RESTART ERROR]:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  },
};
