/**
 * Auto-React Command - GhostG-X Edition
 * Configure les réactions automatiques du système (.env Synced)
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config'); // Importation de la configuration

const prefix = config.prefix;

module.exports = {
  name: 'ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ',
  aliases: ['reflexe_systeme', 'autoreact', 'ar', 'reflexe', 'reaction', 'reactions'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴇs ʀᴇ́ᴀᴄᴛɪᴏɴs ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇs ᴅᴇs sᴄᴇᴀᴜx',
  usage: `${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ/ᴏғғ/sᴇᴛ ʙᴏᴛ/sᴇᴛ ᴀʟʟ`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const envPath = path.join(process.cwd(), '.env');

    try {
      // 1️⃣ Lecture du fichier .env pour connaître le statut physique actuel
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
      const isCurrentlyOn = /^AUTOREACT=true/m.test(envContent);
      const currentMode = config.autoReactMode || 'bot';

      const opt = args.join(' ').toLowerCase();

      if (!args[0]) {
        return reply(
          `*╭╼━━━≪• ᴏᴘᴛɪᴏɴs ᴅᴇs ʀᴇ́ғʟᴇxᴇs •≫━━━╾╮*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏғғ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ sᴇᴛ ʙᴏᴛ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ sᴇᴛ ᴀʟʟ*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      // Cas ON : Activation
      if (opt === 'on') {
        if (isCurrentlyOn) {
          return reply(`*🛡️ ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́s.*`);
        }
        
        // Modification du fichier .env
        if (envContent.match(/^AUTOREACT=/m)) {
          envContent = envContent.replace(/^AUTOREACT=.*/m, `AUTOREACT=true`);
        } else {
          envContent += `\nAUTOREACT=true`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

        // Application immédiate en mémoire
        config.autoReact = true;

        return reply(`*🛡️ ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴀᴄᴛɪᴠᴇ́s.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Cas OFF : Désactivation
      if (opt === 'off') {
        if (!isCurrentlyOn) {
          return reply(`*🔓 ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴅᴇ́ᴊᴀ̀ ᴇ́ᴛᴇɪɴᴛs.*`);
        }
        
        // Modification du fichier .env
        if (envContent.match(/^AUTOREACT=/m)) {
          envContent = envContent.replace(/^AUTOREACT=.*/m, `AUTOREACT=false`);
        } else {
          envContent += `\nAUTOREACT=false`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

        // Application immédiate en mémoire
        config.autoReact = false;

        return reply(`*🔓 ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴇ́ᴛᴇɪɴᴛs.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Cas SET BOT : Réaction seulement aux commandes
      if (opt === 'set bot') {
        if (currentMode === 'bot') {
          return reply(`*🤖 ʟᴇ ᴍᴏᴅᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴄᴏɴғɪɢᴜʀᴇ́ sᴜʀ : ʙᴏᴛ.*`);
        }
        
        config.autoReactMode = 'bot';
        return reply(`*🤖 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴜɴɪǫᴜᴇᴍᴇɴᴛ ᴀᴜx ᴄᴏᴍᴍᴀɴᴅᴇs ᴅᴜ ʙᴏᴛ (⏳).*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Cas SET ALL : Réaction à tous les messages
      if (opt === 'set all') {
        if (currentMode === 'all') {
          return reply(`*🌟 ʟᴇ ᴍᴏᴅᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴄᴏɴғɪɢᴜʀᴇ́ sᴜʀ : ᴀʟʟ.*`);
        }
        
        config.autoReactMode = 'all';
        return reply(`*🌟 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴀ̀ ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Si l'argument passé ne correspond à aucune option
      const etat = isCurrentlyOn ? 'ᴀᴄᴛɪғ' : 'ɪɴᴀᴄᴛɪғ';
      reply(`*〆 ᴇ́ᴛᴀᴛ ᴀᴄᴛᴜᴇʟ :* ${etat} (ᴍᴏᴅᴇ: ${currentMode})\n*ᴜsᴀɢᴇ : ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ/ᴏғғ/sᴇᴛ ʙᴏᴛ/sᴇᴛ ᴀʟʟ*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ sᴄᴇʟʟᴇ́ ʟᴀ ᴍᴏᴅɪғɪᴄᴀᴛɪᴏɴ ᴅᴇs ʀᴇ́ғʟᴇxᴇs.*');
    }
  }
};
