/**
 * Auto-React Command - GhostG-X Edition
 * Configure les réactions automatiques du système
 */

const { load, save } = require('../../utils/autoReact');

module.exports = {
  name: 'ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ',
  aliases: ['reflexe_systeme', 'autoreact', 'ar', 'reflexe', 'reaction', 'reactions'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴄᴏɴғɪɢᴜʀᴇ ʟᴇs ʀᴇ́ᴀᴄᴛɪᴏɴs ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇs ᴅᴇs sᴄᴇᴀᴜx',
  usage: '.ʀᴇғʟᴇxᴇ_sʏsᴛᴇᴍᴇ <ᴏɴ/ᴏғғ/sᴇᴛ ʙᴏᴛ/sᴇᴛ ᴀʟʟ>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        return extra.reply(
          `*╭╼━━━≪• ᴏᴘᴛɪᴏɴs ᴅᴇs ʀᴇ́ғʟᴇxᴇs •≫━━━╾╮*\n` +
          `*┃ • ᴏɴ - ᴀᴄᴛɪᴠᴇʀ ʟᴇs ʀᴇ́ᴀᴄᴛɪᴏɴs*\n` +
          `*┃ • ᴏғғ - ᴅᴇ́sᴀᴄᴛɪᴠᴇʀ ʟᴇs ʀᴇ́ᴀᴄᴛɪᴏɴs*\n` +
          `*┃ • sᴇᴛ ʙᴏᴛ - ʀᴇ́ᴀɢɪʀ ᴀᴜx ɪɴᴠᴏᴄᴀᴛɪᴏɴs*\n` +
          `*┃ • sᴇᴛ ᴀʟʟ - ʀᴇ́ᴀɢɪʀ ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀᴜʀᴀs*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const db = load();
      const opt = args.join(' ').toLowerCase();

      if (opt === 'on') {
        db.enabled = true;
        save(db);
        return extra.reply(`*🛡️ ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴀᴄᴛɪᴠᴇ́s.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'off') {
        db.enabled = false;
        save(db);
        return extra.reply(`*🔓 ʟᴇs ʀᴇ́ғʟᴇxᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴏɴᴛ ᴇ́ᴛᴇɪɴᴛs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'set bot') {
        db.mode = 'bot';
        save(db);
        return extra.reply(`*🤖 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴜɴɪǫᴜᴇᴍᴇɴᴛ ᴀᴜx ᴄᴏᴍᴍᴀɴᴅᴇs ᴅᴜ ʙᴏᴛ (⏳).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (opt === 'set all') {
        db.mode = 'all';
        save(db);
        return extra.reply(`*🌟 ᴍᴏᴅᴇ : ʀᴇ́ᴀᴄᴛɪᴏɴ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴀ̀ ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      extra.reply(`*〆 ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ. ᴜᴛɪʟɪsᴇ : ᴏɴ | ᴏғғ | sᴇᴛ ʙᴏᴛ | sᴇᴛ ᴀʟʟ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      
    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      extra.reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ sᴄᴇʟʟᴇ́ ʟᴀ ᴍᴏᴅɪғɪᴄᴀᴛɪᴏɴ ᴅᴇs ʀᴇ́ғʟᴇxᴇs.*');
    }
  }
};
