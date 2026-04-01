/**
 * Auto-React Command - GhostG-X Edition
 * Configure les réactions automatiques du système
 */

const { load, save } = require('../../utils/autoReact');
const config = require('../../config'); // Importation de la configuration

module.exports = {
  name: 'ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ',
  aliases: ['reflexe_systeme', 'autoreact', 'ar', 'reflexe', 'reaction', 'reactions'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴇs ʀᴇ́ᴀᴄᴛɪᴏɴs ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇs ᴅᴇs sᴄᴇᴀᴜx*',
  usage: `${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ/ᴏғғ/sᴇᴛ ʙᴏᴛ/sᴇᴛ ᴀʟʟ`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;
    const prefix = config.prefix || '.'; // Utilisation du préfixe de la config
    
    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴠᴏɪʀ ʟ\'ɪɴᴠɪsɪʙʟᴇ.*');

    try {
      const db = load();
      const opt = args.join(' ').toLowerCase();

      // Constantes d'état basées sur ton fichier JSON/DB
      const isCurrentlyOn = db.enabled === true;
      const currentMode = db.mode;

      if (!args[0]) {
        return reply(
          `*╭╼━━━≪• ᴏᴘᴛɪᴏɴs ᴅᴇs ʀᴇ́ғʟᴇxᴇs •≫━━━╾╮*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏғғ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ sᴇᴛ ʙᴏᴛ*\n` +
          `*┃ • ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ sᴇᴛ ᴀʟʟ*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      if (opt === 'on') {
        if (isCurrentlyOn) {
          return reply(`*🛡️ ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́s.*`);
        }
        db.enabled = true;
        save(db);
        return reply(`*🛡️ ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴀᴄᴛɪᴠᴇ́s.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'off') {
        if (!isCurrentlyOn) {
          return reply(`*🔓 ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴅᴇ́ᴊᴀ̀ ᴇ́ᴛᴇɪɴᴛs.*`);
        }
        db.enabled = false;
        save(db);
        return reply(`*🔓 ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴇ́ᴛᴇɪɴᴛs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'set bot') {
        if (currentMode === 'bot') {
          return reply(`*🤖 ʟᴇ ᴍᴏᴅᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴄᴏɴғɪɢᴜʀᴇ́ sᴜʀ : ʙᴏᴛ.*`);
        }
        db.mode = 'bot';
        save(db);
        return reply(`*🤖 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴜɴɪǫᴜᴇᴍᴇɴᴛ ᴀᴜx ᴄᴏᴍᴍᴀɴᴅᴇs ᴅᴜ ʙᴏᴛ (⏳).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'set all') {
        if (currentMode === 'all') {
          return reply(`*🌟 ʟᴇ ᴍᴏᴅᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴄᴏɴғɪɢᴜʀᴇ́ sᴜʀ : ᴀʟʟ.*`);
        }
        db.mode = 'all';
        save(db);
        return reply(`*🌟 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴀ̀ ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Si l'argument passé ne correspond à aucune option
      const etat = isCurrentlyOn ? 'ᴀᴄᴛɪғ' : 'ɪɴᴀᴄᴛɪғ';
      reply(`*〆 ᴇ́ᴛᴀᴛ ᴀᴄᴛᴜᴇʟ :* ${etat} (ᴍᴏᴅᴇ: ${currentMode})\n*ᴜsᴀɢᴇ : ${prefix}ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ ᴏɴ/ᴏғғ/sᴇᴛ ʙᴏᴛ/sᴇᴛ ᴀʟʟ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ sᴄᴇʟʟᴇ́ ʟᴀ ᴍᴏᴅɪғɪᴄᴀᴛɪᴏɴ ᴅᴇs ʀᴇ́ғʟᴇxᴇs.*');
    }
  }
};
