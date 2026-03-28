/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Bot Name Controller (AGM Identity V5.2)
 * Dynamic Rebranding & Config Persistence
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_NAME_DESIGN = (oldName, newName) => `*╭╼━≪• ᴀɢᴍ ɪᴅᴇɴᴛɪᴛʏ •≫━╾╮*
*┃*
*┃* 🏷️ *${toSmallCaps('ᴏʟᴅ')}* : ${oldName}
*┃* ✨ *${toSmallCaps('ɴᴇᴡ')}* : ${newName}
*┃* 🟢 *${toSmallCaps('sᴛᴀᴛᴜs')}* : ʀᴇʙʀᴀɴᴅᴇᴅ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'setbotname',
  aliases: ['setname', 'botname', 'setbot'],
  category: 'owner',
  description: 'Changer le nom du bot dynamiquement',
  usage: '.setbotname <nom>',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    const configPath = path.resolve(process.cwd(), 'config.js');
    
    try {
      // Charger la config fraîchement
      if (require.cache[configPath]) delete require.cache[configPath];
      const config = require(configPath);

      let newName = args.join(' ').trim();

      // Support du texte cité (Quoted message)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!newName && quoted) {
        newName = quoted.conversation || quoted.extendedTextMessage?.text || "";
      }

      if (!newName) {
        return reply(`📝 *${toSmallCaps('ᴄᴜʀʀᴇɴᴛ ɴᴀᴍᴇ')} :* ${config.botName}\n\n💡 *${toSmallCaps('ᴜsᴀɢᴇ')} :* .setname <nom>`);
      }

      if (newName.length > 30) return reply(`❌ *${toSmallCaps('nom trop long (max 30)')}*`);

      const oldName = config.botName;

      // --- MISE À JOUR PHYSIQUE DU FICHIER ---
      if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Regex robuste pour capturer botName : "valeur" ou 'valeur'
        const nameRegex = /(botName\s*:\s*)(['"`])(.*?)\2/i;

        if (nameRegex.test(content)) {
            // On s'assure d'échapper les apostrophes pour ne pas casser le JS
            const safeName = newName.replace(/'/g, "\\'");
            content = content.replace(nameRegex, `$1'${safeName}'`);
            
            fs.writeFileSync(configPath, content, 'utf8');

            // --- MISE À JOUR RUNTIME ---
            config.botName = newName;
            if (global.config) global.config.botName = newName;

            await react('✍️');
            return reply(AGM_NAME_DESIGN(oldName, newName));
        } else {
            throw new Error("Clé 'botName' non trouvée dans config.js");
        }
      }

    } catch (error) {
      console.error('[SETNAME ERROR]:', error);
      reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}`);
    }
  }
};
