/**
 * Mode Command - GhostG-X Edition
 * Toggle bot between private and public mode (.env Synced)
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

// Extraction du préfixe pour l'usage
const prefix = config.prefix;

module.exports = {
  name: 'ᴅᴏᴍᴀɪɴᴇ',
  aliases: ['domaine', 'botmode', 'privatemode', 'publicmode', 'mode'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Sécurité : Géré par ton handler
  description: `**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʙᴀsᴄᴜʟᴇ ʟ'ᴏʀᴀᴄʟᴇ ᴇɴᴛʀᴇ ʟᴇ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́ ᴇᴛ ᴘᴜʙʟɪᴄ**`,
  usage: `${prefix}ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const envPath = path.join(process.cwd(), '.env');

    try {
      // 1️⃣ Lecture du fichier .env pour connaître le statut physique actuel
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
      // On vérifie si le mode SELF_MODE est sur true
      const isCurrentlyPrivate = /^SELF_MODE=true/m.test(envContent);

      if (!args[0]) {
        const currentMode = isCurrentlyPrivate ? 'ᴘʀɪᴠᴇ́' : 'ᴘᴜʙʟɪᴄ';
        const description = isCurrentlyPrivate 
          ? `*sᴇᴜʟ ʟᴇ ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ ᴅᴇ ʟ'ᴏʀᴀᴄʟᴇ ᴘᴇᴜᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs*`
          : '*ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs ᴘᴇᴜᴠᴇɴᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs*';

        return reply(
          `*╭╼━━━≪• ᴇ́ᴛᴀᴛ ᴅᴜ ᴅᴏᴍᴀɪɴᴇ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴍᴏᴅᴇ ᴀᴄᴛᴜᴇʟ : ${currentMode}*\n` +
          `*┃ 📜 sᴛᴀᴛᴜᴛ : ${description}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• ${prefix}ᴅᴏᴍᴀɪɴᴇ ᴘʀɪᴠᴇ - sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴀ ʟᴇ ᴘᴏᴜᴠᴏɪʀ*\n` +
          `  *• ${prefix}ᴅᴏᴍᴀɪɴᴇ ᴘᴜʙʟɪᴄ - ʟᴇs ᴘᴏʀᴛᴇs sᴏɴᴛ ᴏᴜᴠᴇʀᴛᴇs*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const mode = args[0].toLowerCase();

      // Cas PRIVÉ
      if (mode === 'private' || mode === 'priv' || mode === 'privé' || mode === 'prive') {
        if (isCurrentlyPrivate) {
          return reply(`*🔒 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ sᴄᴇʟʟᴇ́ ᴇɴ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        // Modification chirurgicale dans le .env
        if (envContent.match(/^SELF_MODE=/m)) {
          envContent = envContent.replace(/^SELF_MODE=.*/m, `SELF_MODE=true`);
        } else {
          envContent += `\nSELF_MODE=true`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

        // Application immédiate en mémoire vive
        config.selfMode = true;

        return reply(`*🔒 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘʀɪᴠᴇ́.*\n*sᴇᴜʟ ʟᴇ sᴜᴘʀᴇ̂ᴍᴇ ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ ᴀ ʟᴇ ᴘᴏᴜᴠᴏɪʀ.\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Cas PUBLIC
      if (mode === 'public' || mode === 'pub') {
        if (!isCurrentlyPrivate) {
          return reply(`*🌐 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴏᴜᴠᴇʀᴛ ᴇɴ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        // Modification chirurgicale dans le .env
        if (envContent.match(/^SELF_MODE=/m)) {
          envContent = envContent.replace(/^SELF_MODE=.*/m, `SELF_MODE=false`);
        } else {
          envContent += `\nSELF_MODE=false`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

        // Application immédiate en mémoire vive
        config.selfMode = false;

        return reply(`*🌐 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘᴜʙʟɪᴄ.*\n*ʟᴇs ᴘᴏʀᴛᴇs sᴏɴᴛ ᴏᴜᴠᴇʀᴛᴇs ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      return reply(`*〆 ᴍᴏᴅᴇ ɪɴᴠᴀʟɪᴅᴇ ! ᴜᴛɪʟɪsᴇ : ${prefix}ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>*`);

    } catch (error) {
      console.error('Mode command error:', error);
      await reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ᴇ̂ᴍᴘᴇ̂ᴄʜᴇ́ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ᴅᴏᴍᴀɪɴᴇ.*');
    }
  }
};
