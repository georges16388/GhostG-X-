/**
 * ᴀɴᴛɪ-ᴄᴀʟʟ sʏsᴛᴇᴍ - ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- FONCTION DE DESIGN AGM SECURITY ---
const AGM_SECURITY = (status) => {
  const state = status === 'on' ? `🟢 ${toSmallCaps('activated')}` : `🔴 ${toSmallCaps('deactivated')}`;
  return `╭╼━≪• *ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sʏsᴛᴇᴍ')} : ${toSmallCaps('ᴀɴᴛɪ-ᴄᴀʟʟ')} 🛡️
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${state}
┃ ${toSmallCaps('ᴘᴏʟɪᴄʏ')} : ${toSmallCaps('ᴀᴜᴛᴏ-ʙʟᴏᴄᴋ')} 🚫
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'anticall',
  aliases: ['ac'],
  category: 'owner',
  description: 'Activer/Désactiver le rejet automatique des appels',
  usage: '.anticall on/off',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const option = args[0]?.toLowerCase();
      if (!option || !['on', 'off'].includes(option)) {
        return extra.reply(`⚠️ *${toSmallCaps("usage")} : .anticall on/off*`);
      }

      const isEnabling = option === 'on';
      const configPath = path.join(__dirname, '../../config.js');

      // Lecture et modification du fichier config
      let configContent = fs.readFileSync(configPath, 'utf8');
      const regex = /anticall:\s*(true|false)/g;
      
      if (regex.test(configContent)) {
        configContent = configContent.replace(regex, `anticall: ${isEnabling}`);
      } else {
        // Si la clé n'existe pas, on l'ajoute proprement (dépend de ta structure config)
        configContent = configContent.replace('module.exports = {', `module.exports = {\n  anticall: ${isEnabling},`);
      }

      fs.writeFileSync(configPath, configContent);
      delete require.cache[require.resolve('../../config')];

      await sock.sendMessage(extra.from, { react: { text: isEnabling ? '🛡️' : '🔓', key: msg.key } });

      await sock.sendMessage(extra.from, {
        text: AGM_SECURITY(option),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛɢ sᴇᴄᴜʀɪᴛʏ ᴄᴏɴᴛʀᴏʟ",
            body: toSmallCaps(isEnabling ? "protection active" : "protection desactivee"),
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

    } catch (err) {
      console.error('[ANTICALL ERROR]:', err);
      await extra.reply(`❌ *${toSmallCaps("erreur lors de la mise a jour")}*`);
    }
  }
};
