/**
 * Bot Restart System - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');

// --- FONCTION DE DESIGN AGM (RESTART STYLE) ---
const AGM_RESTART = (status) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🔄
┃ ᴛᴀsᴋ : ʀᴇʙᴏᴏᴛɪɴɢ...
┃ ᴀᴜᴛʜᴏʀ : ᴏᴡɴᴇʀ 👑
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reload'],
  category: 'owner',
  description: 'Redémarrer le bot proprement',
  usage: '.restart',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      // Réaction immédiate pour montrer que l'ordre est reçu
      await sock.sendMessage(extra.from, { react: { text: '⏳', key: msg.key } });

      // Message d'adieu temporaire
      await extra.reply(AGM_RESTART('🟠 ᴏғғʟɪɴᴇ sᴏᴏɴ'));

      const run = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
          });
        });

      // Délai de 1s pour laisser le temps au message de s'envoyer avant de couper
      setTimeout(async () => {
        try {
          // Si tu utilises PM2 (recommandé pour la stabilité)
          await run('pm2 restart all');
        } catch (e) {
          // Si tu es sur un panel (Pterodactyl/Heroku) ou Nodemon
          // process.exit(0) force le panel à relancer le bot automatiquement
          process.exit(0);
        }
      }, 1000);

    } catch (error) {
      console.error('Restart error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ : ${error.message}*`);
    }
  },
};
