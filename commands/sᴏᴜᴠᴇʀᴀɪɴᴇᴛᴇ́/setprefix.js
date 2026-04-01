/**
 * Set Prefix Command - GhostG-X Edition
 * Modifie le préfixe d'invocation dans le fichier .env et en mémoire
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

const prefix = config.prefix || '.';

module.exports = {
  name: 'sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ',
  aliases: ['signe_commande', 'setprefix', 'prefix', 'prefixe'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀɴsᴍᴜᴛᴇ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs**',
  usage: `${prefix}sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ <ɴᴏᴜᴠᴇᴀᴜ ᴘʀᴇ́ғɪxᴇ>`,
  ownerOnly: true, // Géré par ton handler pour les privilèges suprêmes

  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(
          `*╭╼━━━≪• sɪɢɴᴇ ᴀᴄᴛᴜᴇʟ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴘʀᴇ́ғɪxᴇ : ${config.prefix}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ : ${prefix}sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ <ɴᴏᴜᴠᴇᴀᴜ ᴘʀᴇ́ғɪxᴇ>*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const newPrefix = args[0].trim();

      if (newPrefix.length > 3) {
        return extra.reply('*〆 ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴏɪᴛ ᴄᴏᴍᴘʀᴇɴᴅʀᴇ ᴇɴᴛʀᴇ 1 ᴇᴛ 3 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs !*');
      }

      // 1️⃣ Mise à jour de la configuration en mémoire vive (effet immédiat sans redémarrage)
      config.prefix = newPrefix;
      process.env.PREFIX = newPrefix;

      // 2️⃣ Écriture physique dans le fichier .env pour le préserver au redémarrage
      const envPath = path.join(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8');
        
        // On vérifie si la variable PREFIX existe déjà dans le .env
        if (envContent.match(/^PREFIX=/m)) {
          // Si elle existe, on remplace sa valeur
          envContent = envContent.replace(/^PREFIX=.*/m, `PREFIX=${newPrefix}`);
        } else {
          // Si elle n'existe pas (cas rare), on la rajoute à la fin
          envContent += `\nPREFIX=${newPrefix}`;
        }
        
        fs.writeFileSync(envPath, envContent.trim() + '\n');
      } else {
        // Si le fichier .env n'existe pas du tout (improbable), on le crée
        fs.writeFileSync(envPath, `PREFIX=${newPrefix}\n`);
      }

      await extra.reply(
        `*✅ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ : ${newPrefix}*\n` +
        `_ʟᴇs ᴀʀᴄᴀɴᴇs s'ᴇ́ᴠᴇɪʟʟᴇʀᴏɴᴛ ᴅᴇ́sᴏʀᴍᴀɪs sᴏᴜs ʟᴀ ғᴏʀᴍᴇ : ${newPrefix}ᴄᴏᴍᴍᴀɴᴅᴇ_\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );

    } catch (error) {
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
