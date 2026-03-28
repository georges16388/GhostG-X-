/**
 * ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ sʏsᴛᴇᴍ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_CONFIG = (status, mode) => `╭╼━≪• *ᴀɢᴍ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${status ? '🟢 ᴇɴᴀʙʟᴇᴅ' : '🔴 ᴅɪsᴀʙʟᴇᴅ'}
┃ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps(mode)} ⚡
┃ ${toSmallCaps('sʏsᴛᴇᴍ')} : ${toSmallCaps('ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ')} ✅
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'autoreact',
  aliases: ['ar', 'react'],
  category: 'owner',
  description: 'Gérer les réactions automatiques',
  usage: '.ar on/off/bot/all',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      // 1. Rechargement propre de la config
      const configPath = path.join(process.cwd(), 'config.js');
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      const opt = args[0]?.toLowerCase();

      if (!opt) {
        const currentMode = config.autoReactMode || 'bot';
        const info = `╭╼━≪• *ᴀʀ ᴏᴘᴛɪᴏɴs* •≫━╾╮\n┃\n┃ ${toSmallCaps('ᴄᴜʀʀᴇɴᴛ')} : ${config.autoReact ? '✅ ON' : '❌ OFF'}\n┃ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps(currentMode)}\n┃\n╰━━━━━━━━━━━━━━━╯`;
        return extra.reply(info);
      }

      let newStatus = config.autoReact;
      let newMode = config.autoReactMode || 'bot';

      if (opt === 'on') newStatus = true;
      else if (opt === 'off') newStatus = false;
      else if (opt === 'bot') { newMode = 'bot'; newStatus = true; }
      else if (opt === 'all') { newMode = 'all'; newStatus = true; }
      else return extra.reply(`❌ *${toSmallCaps("options")} : on, off, bot, all*`);

      // 2. Mise à jour physique du fichier config.js
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Update autoReact (boolean)
      content = content.replace(/(autoReact\s*:\s*)(true|false)/g, `$1${newStatus}`);
      // Update autoReactMode (string)
      content = content.replace(/(autoReactMode\s*:\s*['"])([^'"]+)(['"])/g, `$1${newMode}$3`);
      
      fs.writeFileSync(configPath, content);

      await sock.sendMessage(extra.from, { react: { text: '⚙️', key: msg.key } });
      await extra.reply(AGM_DESIGN_MSG(newStatus, newMode));

    } catch (err) {
      console.error('[AUTOREACT ERROR]:', err);
      await extra.reply(`❌ *${toSmallCaps("erreur systeme")}*`);
    }
  }
};

function AGM_DESIGN_MSG(status, mode) {
    return AGM_CONFIG(status, mode);
}
