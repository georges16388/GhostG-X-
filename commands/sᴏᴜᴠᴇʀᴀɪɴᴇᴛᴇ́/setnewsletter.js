/**
 * SetNewsletter Command - GhostG-X Edition
 * Lie le JID du canal de diffusion pour le transfert du menu
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ',
  aliases: ['sceau_canal', 'setnewsletter', 'setnl', 'setchannel'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ʟɪᴇ ʟᴇ ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ ᴘᴏᴜʀ ʟᴇ ᴛʀᴀɴsғᴇʀᴛ ᴅᴇs ᴍᴇɴᴜs',
  usage: `${prefix}sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ <ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ>`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;

    try {
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      let newsletterJid = '';

      // 1. Lecture directe si la commande est lancée DEPUIS un canal
      if (msg.key.remoteJid && msg.key.remoteJid.endsWith('@newsletter')) {
        newsletterJid = msg.key.remoteJid;
      } 
      // 2. Lecture si on cite un message provenant d'un canal
      else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = msg.message.extendedTextMessage.contextInfo;
        const findNewsletterJid = (obj, depth = 0) => {
          if (depth > 5 || !obj || typeof obj !== 'object') return null;
          for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string' && value.endsWith('@newsletter')) return value;
            if (typeof value === 'object' && value !== null) {
              const found = findNewsletterJid(value, depth + 1);
              if (found) return found;
            }
          }
          return null;
        };
        newsletterJid = findNewsletterJid(contextInfo);
      } 
      // 3. Lecture via l'argument fourni
      else if (args[0]) {
        newsletterJid = args[0].trim();
      }

      // Si aucun JID n'est fourni ou trouvé, on affiche le statut
      if (!newsletterJid) {
        const currentJid = config.newsletterJid || 'ɴᴏɴ ᴅᴇ́ғɪɴɪ';
        return reply(
          `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴊɪᴅ ᴀᴄᴛᴜᴇʟ : \`${currentJid}\`*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• ${prefix}sᴄᴇᴀᴜ_ᴄᴀɴᴀʟ <ᴊɪᴅ ᴅᴜ ᴄᴀɴᴀʟ>*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      if (!newsletterJid.endsWith('@newsletter')) {
        return reply('*〆 sᴛʀᴜᴄᴛᴜʀᴇ ᴅᴇ ᴊɪᴅ ɪɴᴠᴀʟɪᴅᴇ !*');
      }

      // 💥 ÉCRITURE SÉCURISÉE DANS LE FICHIER CONFIG.JS
      const configPath = path.join(process.cwd(), 'config.js');
      let configContent = fs.readFileSync(configPath, 'utf8');

      if (configContent.includes('newsletterJid:')) {
        // Remplacement de la valeur existante
        configContent = configContent.replace(
          /newsletterJid:\s*['"][^'"]*['"]/,
          `newsletterJid: '${newsletterJid}'`
        );
      } else {
        // Insertion propre juste avant la fin du module.exports
        configContent = configContent.replace(
          /(\};?\s*$)/,
          `  newsletterJid: '${newsletterJid}',\n$1`
        );
      }

      fs.writeFileSync(configPath, configContent, 'utf8');
      
      // Mise à jour immédiate en mémoire vive
      config.newsletterJid = newsletterJid;

      await reply(
        `*✅ sᴄᴇᴀᴜ ᴅᴜ ᴄᴀɴᴀʟ ᴀʟɪɢɴᴇ́ !*\n` +
        `*📰 ᴊɪᴅ ʟɪᴇ́ : \`${newsletterJid}\`*\n\n` +
        `*💡 ʟ'ᴏʀᴀᴄʟᴇ ᴜᴛɪʟɪsᴇʀᴀ ᴅᴇsᴏʀᴍᴀɪs ᴄᴇ ᴄᴀɴᴀʟ ᴘᴏᴜʀ ʟᴇ ᴍᴇɴᴜ.*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      );

    } catch (error) {
      console.error('SetNewsletter command error:', error);
      await reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
