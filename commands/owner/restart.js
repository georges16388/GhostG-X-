/**
 * Bot Restart System - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (RESTART STYLE) ---
const AGM_RESTART = (status) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🔄
┃ ᴛᴀsᴋ : ʀᴇʙᴏᴏᴛɪɴɢ...
┃ ᴀᴜᴛʜᴏʀ : @${sender.split('@')[0]}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'relancer'],
  category: 'owner',
  description: 'Redémarrer le bot proprement et vider le cache temporaire.',
  usage: '.restart',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;

      // 1. Réaction immédiate (Vitesse 100ms)
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      // 2. Message de confirmation avec ton numéro
      await sock.sendMessage(from, { 
          text: AGM_RESTART('🟠 ᴏғғʟɪɴᴇ sᴏᴏɴ'),
          mentions: [extra.sender]
      }, { quoted: msg });

      // 3. Nettoyage du dossier TMP (Optionnel mais recommandé)
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (fs.existsSync(tmpDir)) {
          fs.readdirSync(tmpDir).forEach(file => {
              try { fs.unlinkSync(path.join(tmpDir, file)); } catch (e) {}
          });
      }

      // 4. Exécution du Reboot
      setTimeout(async () => {
        try {
          // Si PM2 est installé sur ton serveur
          exec('pm2 restart all', (err) => {
            if (err) {
              // Si PM2 échoue, on force l'arrêt (le panel relancera le bot)
              process.exit(0);
            }
          });
        } catch (e) {
          process.exit(0);
        }
      }, 2000); // On attend 2s pour s'assurer que les messages WhatsApp sont bien partis

    } catch (error) {
      console.error('Restart error:', error);
      await sock.sendMessage(extra.from, { text: `❌ *ᴇʀʀᴇᴜʀ : ${error.message}*` }, { quoted: msg });
    }
  },
};
