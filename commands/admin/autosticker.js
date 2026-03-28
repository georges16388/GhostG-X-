/**
 * AutoSticker Command - AGM Design Edition
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
const AGM_DESIGN = (status) => {
  const sLabel = status === 'ON' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ';
  return `*╭╼━≪• ${toStyledCaps('ᴀᴜᴛᴏ-sᴛɪᴄᴋᴇʀ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ⚙️ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(sLabel)}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ᴀᴜᴛᴏ-ᴄᴏɴᴠᴇʀᴛ')}*
*┃* 🎬 *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps('ɪᴍɢ & ᴠɪᴅ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*`;
};

module.exports = {
  name: 'autosticker',
  aliases: ['autos', 'asticker'],
  category: 'admin',
  description: 'Activer ou désactiver la conversion automatique des médias en stickers.',
  usage: '.autosticker <on/off>',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const settings = database.getGroupSettings(from) || {};
      let status = settings.autosticker ? 'ON' : 'OFF';

      // --- AFFICHAGE DU STATUT ACTUEL ---
      if (!args[0]) {
        await react('🎨');
        return reply(AGM_DESIGN(status));
      }

      const opt = args[0].toLowerCase();

      // --- ACTIVATION ---
      if (opt === 'on' || opt === 'active') {
        await react('✅');
        database.updateGroupSettings(from, { autosticker: true });
        return reply(AGM_DESIGN('ON'));
      }

      // --- DÉSACTIVATION ---
      if (opt === 'off' || opt === 'disable') {
        await react('⚠️');
        database.updateGroupSettings(from, { autosticker: false });
        return reply(AGM_DESIGN('OFF'));
      }

      return reply(`⚠️ *${toStyledCaps('ᴜsᴀɢᴇ')}* : *.ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ ᴏɴ | ᴏꜰꜰ*`);

    } catch (error) {
      console.error('[AutoSticker Error]:', error);
      await reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
