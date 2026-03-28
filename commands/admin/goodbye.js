/**
 * GOODBYE COMMAND - AGM SYSTEM CORE
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const db = require('../../database');

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

// --- DESIGN AGM PRESTIGE (GRAS) ---
const GOODBYE_DESIGN = (status) => {
  const sLabel = status === 'on' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ';
  return `*╭╼━≪• ${toStyledCaps('ɢᴏᴏᴅʙʏᴇ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ⚙️ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(sLabel)}*
*┃* 👤 *${toStyledCaps('ᴛᴀʀɢᴇᴛ')}* : *${toStyledCaps('ʟᴇᴀᴠɪɴɢ ᴍᴇᴍʙᴇʀs')}*
*┃* 👋 *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}* : *${toStyledCaps('ᴀᴜᴛᴏ-ꜰᴀʀᴇᴡᴇʟʟ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff'],
  category: 'admin',
  description: 'Activer ou désactiver les messages de départ.',
  usage: '.goodbye on/off',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const settings = db.getGroupSettings(from) || {};
      const action = args[0]?.toLowerCase();

      // --- AFFICHAGE DU STATUT SI PAS D'ARGUMENT ---
      if (!action || !['on', 'off'].includes(action)) {
        const currentStatus = settings.goodbye ? 'on' : 'off';
        const currentMsg = settings.goodbyeMessage || toStyledCaps("ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇꜰɪɴɪ");
        
        await react('ℹ️');
        return reply(
          `${GOODBYE_DESIGN(currentStatus)}\n\n` +
          `📝 *${toStyledCaps('ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ')} :*\n${currentMsg}\n\n` +
          `💡 *${toStyledCaps('ᴜsᴀɢᴇ')} :*\n` +
          `  > *.ɢᴏᴏᴅʙʏᴇ ᴏɴ*\n` +
          `  > *.ɢᴏᴏᴅʙʏᴇ ᴏꜰꜰ*`
        );
      }

      // --- MISE À JOUR DU STATUT ---
      const enable = action === 'on';
      db.updateGroupSettings(from, { goodbye: enable });
      
      await react(enable ? '✅' : '⚠️');

      return reply(
        `${GOODBYE_DESIGN(action)}\n\n` +
        `✅ *${toStyledCaps('ʟᴇ sʏsᴛᴇᴍᴇ ɢᴏᴏᴅʙʏᴇ ᴇsᴛ')}* *${toStyledCaps(enable ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ')}* !`
      );

    } catch (error) {
      console.error('[GOODBYE ERROR]:', error);
      reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
