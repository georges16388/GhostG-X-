/**
 * ANTI-GROUP MENTION COMMAND - AGM SYSTEM CORE
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

// --- DESIGN AGM PRESTIGE (GRAS) ---
const AGM_STATUS = (status, action) => {
  const sLabel = status === 'on' ? '🟢 ᴀᴄᴛɪᴠᴇ' : '🔴 ᴅɪsᴀʙʟᴇᴅ';
  return `*╭╼━≪• ${toStyledCaps('ᴀɢᴍ ᴘʀᴇᴛᴇᴄᴛɪᴏɴ')} •≫━╾╮*
*┃*
*┃* 🛡️ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(sLabel)}*
*┃* ⚙️ *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}* : *${toStyledCaps(action)}*
*┃* 🌐 *${toStyledCaps('sᴄᴏᴘᴇ')}* : *${toStyledCaps('ɢʀᴏᴜᴘ ᴏɴʟʏ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*`;
};

module.exports = {
  name: 'antigroupmention',
  aliases: ['agm', 'antitag'],
  category: 'admin',
  description: 'Configure la protection contre les mentions de groupe (@everyone/@all).',
  usage: '.agm on/off | .agm set delete/kick',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, { from, react, reply }) {
    try {
      // 1. Récupération des paramètres (Correction des noms de méthodes)
      const settings = database.getGroupSettings(from) || {};
      let currentStatus = settings.antigroupmention ? 'on' : 'off';
      let currentAction = settings.antigroupmentionaction || 'delete';

      // 2. Affichage du statut actuel
      if (!args[0]) {
        await react('🛡️');
        return reply(AGM_STATUS(currentStatus, currentAction));
      }

      const opt = args[0].toLowerCase();

      // 3. Activation / Désactivation
      if (opt === 'on' || opt === 'active') {
        await react('✅');
        database.updateGroupSettings(from, { antigroupmention: true });
        return reply(AGM_STATUS('on', currentAction));
      }

      if (opt === 'off' || opt === 'disable') {
        await react('⚠️');
        database.updateGroupSettings(from, { antigroupmention: false });
        return reply(AGM_STATUS('off', currentAction));
      }

      // 4. Configuration de l'action (SET)
      if (opt === 'set') {
        const setAction = args[1]?.toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`❌ *${toStyledCaps('ᴀᴄᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ : ᴅᴇʟᴇᴛᴇ ᴏᴜ ᴋɪᴄᴋ')}*`);
        }

        await react('⚙️');
        database.updateGroupSettings(from, { 
          antigroupmentionaction: setAction,
          antigroupmention: true 
        });

        return reply(`✅ *${toStyledCaps('ᴀᴄᴛɪᴏɴ ᴀɢᴍ ᴅᴇꜰɪɴɪᴇ sᴜʀ')}* : *${toStyledCaps(setAction)}*`);
      }

      return reply(`⚠️ *${toStyledCaps('ᴜsᴀɢᴇ')}* : *.ᴀɢᴍ ᴏɴ | ᴏꜰꜰ | sᴇᴛ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ*`);

    } catch (error) {
      console.error('[AGM CMD ERROR]:', error);
      reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
