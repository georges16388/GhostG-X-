/**
 * Newsletter Linker - AGM Global System
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (SYSTEM STYLE) ---
const AGM_LINK = (jid) => `╭╼━≪• ᴀɢᴍ ɴᴇᴡsʟᴇᴛᴛᴇʀ ʟɪɴᴋ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 sʏɴᴄᴇᴅ
┃ ᴛᴀʀɢᴇᴛ : ${jid.split('@')[0].substring(0, 12)}...
┃ ᴍᴏᴅᴇ : ғᴏʀᴡᴀʀᴅ-ᴇɴᴀʙʟᴇᴅ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setnewsletter',
  aliases: ['setnl', 'setchannel'],
  category: 'owner',
  description: 'Lier le canal officiel pour le transfert du menu',
  usage: '.setnl <JID> ou répondre à un message du canal',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const config = require('../../config');
      let newsletterJid = '';
      
      // 1. Détection si on est DANS le canal
      if (msg.key.remoteJid?.endsWith('@newsletter')) {
        newsletterJid = msg.key.remoteJid;
      }
      // 2. Détection par réponse à un message du canal
      else if (msg.message?.extendedTextMessage?.contextInfo) {
        const ctx = msg.message.extendedTextMessage.contextInfo;
        
        const findJid = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          for (const key in obj) {
            if (typeof obj[key] === 'string' && obj[key].endsWith('@newsletter')) return obj[key];
            if (typeof obj[key] === 'object') {
              const found = findJid(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        newsletterJid = findJid(ctx);
      } 
      // 3. Détection par argument direct
      else if (args[0]?.endsWith('@newsletter')) {
        newsletterJid = args[0];
      }

      if (!newsletterJid) {
        return extra.reply(`⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇ ᴠᴏᴛʀᴇ ᴄᴀɴᴀʟ ᴏᴜ ᴇɴᴛʀᴇʀ ʟ'ɪᴅ.*`);
      }

      await sock.sendMessage(extra.from, { react: { text: '🔗', key: msg.key } });

      // --- MISE À JOUR CONFIG.JS ---
      const configPath = path.join(__dirname, '../../config.js');
      let content = fs.readFileSync(configPath, 'utf8');
      
      if (content.includes('newsletterJid:')) {
        content = content.replace(/newsletterJid:\s*['"]([^'"]+)['"]/, `newsletterJid: '${newsletterJid}'`);
      } else {
        content = content.replace(/(sessionName:\s*['"][^'"]+['"],)/, `$1\n    newsletterJid: '${newsletterJid}',`);
      }

      fs.writeFileSync(configPath, content, 'utf8');
      config.newsletterJid = newsletterJid;
      delete require.cache[require.resolve('../../config')];

      await extra.reply(AGM_LINK(newsletterJid));

    } catch (error) {
      console.error('SetNL Error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʟɪᴀɪsᴏɴ ᴅᴜ ᴄᴀɴᴀʟ.*');
    }
  }
};
