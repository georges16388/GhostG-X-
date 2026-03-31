/**
 * SetNewsletter Command - GhostG-X Edition
 * Lie le JID du canal de diffusion pour le transfert du menu
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
  name: 'sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ',
  aliases: ['sceau_canal', 'setnewsletter', 'setnl', 'setchannel'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ʟɪᴇ ʟᴇ ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ ᴘᴏᴜʀ ʟᴇ ᴛʀᴀɴsғᴇʀᴛ ᴅᴇs ᴍᴇɴᴜs (sᴜᴘʀᴇᴍᴇ ᴏᴡɴᴇʀ)',
  usage: '.sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ <ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ>',
  ownerOnly: true,
  adminOnly: false,
  groupOnly: false,
  botAdminOnly: false,
  
  async execute(sock, msg, args, extra) {
    try {
      // Sécurité absolue : Liaison avec le Maître Suprême défini dans le .env
      const supremeOwner = config.supremeOwner || '22651622652@s.whatsapp.net';
      if (extra.sender !== supremeOwner) {
        return extra.reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      const chatId = extra.from;
      let newsletterJid = '';
      
      // Vérification si l'on se trouve directement dans la discussion du canal
      if (msg.key.remoteJid && msg.key.remoteJid.endsWith('@newsletter')) {
        newsletterJid = msg.key.remoteJid;
      }
      // Vérification si l'on répond à un message transféré depuis le canal
      else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = msg.message.extendedTextMessage.contextInfo;
        
        // Recherche récursive du JID du canal dans les objets de contexte
        const findNewsletterJid = (obj, depth = 0) => {
          if (depth > 5 || !obj || typeof obj !== 'object') return null;
          
          for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string' && value.endsWith('@newsletter')) {
              return value;
            }
            if (typeof value === 'object' && value !== null) {
              const found = findNewsletterJid(value, depth + 1);
              if (found) return found;
            }
          }
          return null;
        };
        
        newsletterJid = findNewsletterJid(contextInfo);
        
        if (!newsletterJid) {
          return extra.reply('*〆 ʟ\'ᴀᴜʀᴀ ᴄɪᴛᴇ́ᴇ ɴᴇ ᴘʀᴏᴠɪᴇɴᴛ ᴘᴀs ᴅ\'ᴜɴ ᴄᴀɴᴀʟ !*\n\n*ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇ ᴄᴀɴᴀʟ ᴏᴜ ғᴏᴜʀɴɪs ʟᴇ ᴊɪᴅ sᴏᴜs ғᴏʀᴍᴇ ᴅᴇ ᴛᴇxᴛᴇ.*');
        }
      } else if (args[0]) {
        newsletterJid = args[0].trim();
      } else {
        // Affichage du statut actuel
        const currentJid = config.newsletterJid || 'ɴᴏɴ ᴅᴇ́ғɪɴɪ';
        return extra.reply(
          `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴊɪᴅ ᴀᴄᴛᴜᴇʟ : \`${currentJid}\`*\n` +
          `*┃ 📛 ɴᴏᴍ : ${config.botName || 'ɢʜᴏsᴛɢ-x'}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• .sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ <ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ>*\n` +
          `  *• ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴅᴜ ᴄᴀɴᴀʟ ᴀᴠᴇᴄ ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ*\n\n` +
          `*ᴇxᴇᴍᴘʟᴇ : .sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ 120363388565127379@newsletter*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      // Validation du format JID
      if (!newsletterJid.endsWith('@newsletter')) {
        return extra.reply('*〆 sᴛʀᴜᴄᴛᴜʀᴇ ᴅᴇ ᴊɪᴅ ɪɴᴠᴀʟɪᴅᴇ ! ɪʟ ᴅᴏɪᴛ sᴇ ᴛᴇʀᴍɪɴᴇʀ ᴘᴀʀ `@newsletter`.*');
      }
      
      // Écriture physique dans le fichier config.js
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      if (configContent.includes('newsletterJid:')) {
        configContent = configContent.replace(
          /newsletterJid:\s*['"]([^'"]+)['"]/,
          `newsletterJid: '${newsletterJid}'`
        );
      } else {
        configContent = configContent.replace(
          /(sessionName:\s*['"][^'"]+['"],)/,
          `$1\n    newsletterJid: '${newsletterJid}', // Newsletter JID for menu forwarding`
        );
      }
      
      fs.writeFileSync(configPath, configContent, 'utf8');
      
      // Mise à jour de la configuration en mémoire vive
      config.newsletterJid = newsletterJid;
      
      await extra.reply(
        `*✅ sᴄᴇᴀᴜ ᴅᴜ ᴄᴀɴᴀʟ ᴀʟɪɢɴᴇ́ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s !*\n\n` +
        `*📰 ᴊɪᴅ ʟɪᴇ́ : \`${newsletterJid}\`*\n` +
        `*📛 ɴᴏᴍ : ${config.botName || 'ɢʜᴏsᴛɢ-x'}*\n\n` +
        `_ʟᴇ sʏsᴛᴇ̀ᴍᴇ ᴇsᴛ ᴘʀᴇ̂ᴛ ᴀ̀ sᴇ sᴇʀᴠɪʀ ᴅᴇ ᴄᴇ ᴄᴀɴᴀʟ ᴘᴏᴜʀ ᴛʀᴀɴsғᴇ́ʀᴇʀ ʟᴇ ᴍᴇɴᴜ._\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );
      
    } catch (error) {
      console.error('SetNewsletter command error:', error);
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
