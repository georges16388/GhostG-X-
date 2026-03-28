/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Bot Mode Controller (AGM System Core V5.2)
 * Persistence System: Config + ENV Sync
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_MODE_DESIGN = (mode) => `*╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴍᴏᴅᴇ •≫━╾╮*
*┃*
*┃* 💡 *${toSmallCaps('sᴛᴀᴛᴜs')}* : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
*┃* ⚙️ *${toSmallCaps('ᴍᴏᴅᴇ')}* : ${mode === 'private' ? '🔒 ᴘʀɪᴠᴀᴛᴇ' : '🌐 ᴘᴜʙʟɪᴄ'}
*┃* 🛡️ *${toSmallCaps('ᴀᴄᴄᴇss')}* : ${mode === 'private' ? 'ᴏᴡɴᴇʀ ᴏɴʟʏ' : 'ᴇᴠᴇʀʏᴏɴᴇ'}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'self', 'public', 'private'],
  category: 'owner',
  description: 'Bascule entre mode privé et public',
  usage: '.mode public/private',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    const config = global.config || require('../../config');
    let input = args[0]?.toLowerCase();

    // --- ÉTAT ACTUEL ---
    if (!input) {
        const current = config.selfMode ? 'PRIVATE 🔒' : 'PUBLIC 🌐';
        return reply(`*╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮*\n*┃* 🏷️ *${toSmallCaps('ᴄᴜʀʀᴇɴᴛ')}* : ${current}\n*┃* 💡 *${toSmallCaps('ᴜsᴀɢᴇ')}* : .mode pub/priv\n*╰━━━━━━━━━━━━━━━╯*`);
    }

    await react('⚙️');

    let targetMode;
    if (['private', 'priv', 'self', '1'].includes(input)) targetMode = true;
    else if (['public', 'pub', '0'].includes(input)) targetMode = false;
    else return reply(`❌ *${toSmallCaps("option invalide (pub/priv)")}*`);

    try {
      const success = updatePersistence(targetMode);

      if (success) {
        // Mise à jour immédiate en mémoire (Runtime)
        config.selfMode = targetMode;
        if (global.config) global.config.selfMode = targetMode;

        await react('✅');
        return reply(AGM_MODE_DESIGN(targetMode ? 'private' : 'public'));
      } else {
        throw new Error("Échec de l'écriture des fichiers.");
      }
    } catch (error) {
      console.error('[MODE ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur systeme")}* : ${error.message}`);
    }
  }
};

/**
 * Mise à jour physique des fichiers (Config & ENV)
 */
function updatePersistence(value) {
  const configPath = path.join(process.cwd(), 'config.js');
  const envPath = path.join(process.cwd(), '.env');

  try {
    // 1. Update config.js
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, 'utf8');
      // Regex flexible pour attraper selfMode peu importe les espaces ou guillemets
      const regex = /selfMode\s*:\s*(true|false|['"]true['"]|['"]false['"])/i;
      
      if (regex.test(content)) {
        content = content.replace(regex, `selfMode: ${value}`);
        fs.writeFileSync(configPath, content, 'utf8');
      }
    }

    // 2. Update .env
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const envRegex = /^SELF_MODE\s*=\s*.*/m;

      if (envRegex.test(envContent)) {
        envContent = envContent.replace(envRegex, `SELF_MODE=${value}`);
      } else {
        envContent += `\nSELF_MODE=${value}`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }

    return true;
  } catch (e) {
    return false;
  }
}
