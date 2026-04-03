/**
 * Ban Command - GhostG-X Edition
 * Bannit et condamne une entité dans le sanctuaire
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config'); // Importation de la configuration

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'condamner',
  aliases: ['ban', 'sceller'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇᴍᴘᴇ̂ᴄʜᴇ ᴀ̀ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴅ\'ᴜᴛɪʟɪsᴇʀ ʟ\'ᴏʀᴀᴄʟᴇ',
  usage: `${prefix}condamner @ᴜsᴇʀ ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    // 👑 Tes numéros de Maîtres Suprêmes en clair
    const supremeOwners = ['22651622652', '22665108174'];

    // Récupération de l'expéditeur et formatage
    const senderNumber = extra.sender.replace(/\D/g, ''); 
    const isMaster = supremeOwners.includes(senderNumber);

    // Seuls les Supreme Owners ou le bot lui-même peuvent bannir
    const botId = sock.user.id.split(':')[0].replace(/\D/g, '');
    if (!isMaster && senderNumber !== botId) {
        return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴍᴀɴɪᴇʀ ʟᴀ ᴊᴜsᴛɪᴄᴇ.*');
    }

    try {
      let target;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // 1. Extraction de la cible via mention
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } 
      // 2. Extraction de la cible via réponse à un message (quoted)
      else if (ctx && ctx.quotedMessage) {
        target = ctx.participant || (isGroup ? null : chatId);

        if (!target) {
            return reply(`*〆 ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴄɪʙʟᴇʀ ᴄᴇᴛᴛᴇ ᴀ̂ᴍᴇ.*`);
        }
      } 
      // Si aucune cible n'est trouvée
      else {
        return reply(`*〆 ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ ᴘᴏᴜʀ ʟᴀ ᴄᴏɴᴅᴀᴍɴᴇʀ !*\n*ᴜsᴀɢᴇ : ${prefix}condamner @ᴜsᴇʀ*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // 🛡️ Vérification d'immunité absolue
      const cleanTarget = target.replace(/\D/g, '');

      if (supremeOwners.includes(cleanTarget) || cleanTarget === botId) {
        return reply(`*〆 ᴛᴜ ɴᴇ ᴘᴇᴜx ᴘᴀs ᴄᴏɴᴅᴀᴍɴᴇʀ ʟᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ ᴏᴜ ʟ'ᴏʀᴀᴄʟᴇ ʟᴜɪ-ᴍᴇ̂ᴍᴇ.*`);
      }

      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

      let bannedList = [];
      const bannedMatch = envContent.match(/^BANNED_USERS=(.*)$/m);

      if (bannedMatch) {
        bannedList = bannedMatch[1].split(',').filter(j => j.trim() !== '');
      }

      // Si l'utilisateur est déjà condamné
      if (bannedList.includes(target)) {
        return reply(`*⚖️ ᴄᴇᴛᴛᴇ ᴀ̂ᴍᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ sᴄᴇʟʟᴇ́ᴇ ᴇᴛ ᴄᴏɴᴅᴀᴍɴᴇ́ᴇ.*`);
      }

      // Ajout à la liste et réécriture du .env
      bannedList.push(target);
      const newBannedString = bannedList.join(',');

      if (envContent.match(/^BANNED_USERS=/m)) {
        envContent = envContent.replace(/^BANNED_USERS=.*/m, `BANNED_USERS=${newBannedString}`);
      } else {
        envContent += `\nBANNED_USERS=${newBannedString}`;
      }

      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

      // Message de confirmation avec mention
      await sock.sendMessage(chatId, {
        text: `*⚖️ ʟ\'ᴀ̂ᴍᴇ de @${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ᴄᴏɴᴅᴀᴍɴᴇ́ᴇ ᴇᴛ sᴄᴇʟʟᴇ́ᴇ ᴅᴀɴs ʟᴇs ᴀʀᴄᴀɴᴇs !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[ban cmd] error:', error);
      await reply(`*〆 ʟᴀ sᴇɴᴛᴇɴᴄᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
