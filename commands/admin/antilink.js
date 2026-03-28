/**
 * Antilink Command - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM PRESTIGE (GRAS) ---
const AGM_DESIGN = (status, action) => {
  const sLabel = status === 'ON' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ';
  return `*╭╼━≪• ${toStyledCaps('ᴀɴᴛɪ-ʟɪɴᴋ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* 🛡️ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(sLabel)}*
*┃* ⚙️ *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}* : *${toStyledCaps(action)}*
*┃* ⚡ *${toStyledCaps('ɢᴜᴀʀᴅ')}* : *${toStyledCaps('ᴀᴄᴛɪᴠᴇ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'antilink',
  aliases: ['anti-link'],
  category: 'admin',
  description: 'Configure la protection antilink (delete/kick).',
  usage: '.antilink <on/off/set>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const settings = database.getGroupSettings(from) || {};
      let status = settings.antilink ? 'ON' : 'OFF';
      let action = settings.antilinkAction || 'delete';

      // --- AFFICHAGE DU STATUT ---
      if (!args[0] || args[0].toLowerCase() === 'get') {
        await react('🛡️');
        return reply(AGM_DESIGN(status, action));
      }

      const opt = args[0].toLowerCase();

      // --- ACTIVATION ---
      if (opt === 'on') {
        await react('✅');
        database.updateGroupSettings(from, { antilink: true });
        return reply(AGM_DESIGN('ON', action));
      }

      // --- DÉSACTIVATION ---
      if (opt === 'off') {
        await react('⚠️');
        database.updateGroupSettings(from, { antilink: false });
        return reply(AGM_DESIGN('OFF', action));
      }

      // --- CONFIGURATION ACTION ---
      if (opt === 'set') {
        const setAction = args[1]?.toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`❌ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇᴄɪғɪᴇʀ : ᴅᴇʟᴇᴛᴇ ᴏᴜ ᴋɪᴄᴋ')}*`);
        }

        await react('⚙️');
        database.updateGroupSettings(from, { 
          antilinkAction: setAction,
          antilink: true 
        });
        return reply(AGM_DESIGN('ON', setAction));
      }

      return reply(`⚠️ *${toStyledCaps('ᴜsᴀɢᴇ')}* : *.ᴀɴᴛɪʟɪɴᴋ ᴏɴ | ᴏꜰꜰ | sᴇᴛ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ*`);

    } catch (error) {
      console.error('Antilink Error:', error);
      await reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
