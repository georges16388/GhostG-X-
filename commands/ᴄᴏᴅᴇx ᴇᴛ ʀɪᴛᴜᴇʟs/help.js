/**
 * Help Command - Show detailed help for a specific command
 * GhostG-X Edition
 */

const { loadCommands } = require('../../utils/commandLoader');
const config = require('../../config.js');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'help',
  aliases: ['h', 'aide', 'l'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ʟᴇs ᴅᴇᴛᴀɪʟs ᴇᴛ ʟ\'ᴜᴛɪʟɪsᴀᴛɪᴏɴ ᴅ\'ᴜɴᴇ ᴄᴏᴍᴍᴀɴᴅᴇ sᴘᴇᴄɪғɪǫᴜᴇ**',
  usage: `${config.prefix || '.'}help [nom du sort]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = extra.from;

    try {
      const prefix = config.prefix || '.';
      const commands = loadCommands();
      const senderId = extra.sender;

      // --- CAS 1 : AIDE SPÉCIFIQUE ---
      if (args.length > 0) {
        let search = args[0].toLowerCase();
        let targetCmd = null;

        commands.forEach((cmd) => {
          if (cmd.name.toLowerCase() === search || (cmd.aliases && cmd.aliases.includes(search))) {
            targetCmd = cmd;
          }
        });

        // ❌ COMMANDE INTROUVABLE (Version customisée et stylisée)
        if (!targetCmd) {
          return await reply(
            `*❌ ${toSmallCaps('commande')} \`${args[0]}\` ${toSmallCaps('introuvable')}.*\n` +
            `*💡 ${toSmallCaps('tape')} \`${prefix}menu\` ${toSmallCaps('pour voir les commandes existantes')}.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        }

        // 1. Remplacement dynamique de "${prefix}" par le vrai préfixe
        let rawUsage = targetCmd.usage || '';
        let formattedUsage = rawUsage.replace(/\$\{prefix\}/g, prefix);

        // 2. Construction du bloc d'aide (avec espaces après les bordures '┃ ')
        let helpDetail = `╭╼━≪• *⚡ ${toSmallCaps('aide rituel')}* •≫━╾╮\n` +
                         `┃ 🔮 *sᴏʀᴛ* : ${targetCmd.name}\n` +
                         `┃ 🏷️ *ᴀʟɪᴀs* : ${targetCmd.aliases ? targetCmd.aliases.join(', ') : 'ᴀᴜᴄᴜɴ'}\n` +
                         `┃ 🧩 *ᴄᴀᴛᴇɢᴏʀɪᴇ* : ${targetCmd.category || '🔮 ᴀᴜᴛʀᴇs sᴏʀᴛs'}\n`;
        
        if (formattedUsage) {
          const usageLines = formattedUsage.split('\n');
  const activePrefix = config.prefix || '.';
          const indentedUsage = usageLines.map(line => `┃ [ ${activePrefix} ] 💡 *ᴜsᴀɢᴇ* : ${line}`).join('\n');
          helpDetail += indentedUsage + '\n';
        }

        helpDetail += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                      `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n_${targetCmd.description || 'Aucune description disponible.'}_\n\n` +
                      `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
                      `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

        return await reply(helpDetail);
      }

      // --- CAS 2 : AIDE GÉNÉRALE ---
      let generalHelp = `╭╼━≪• *ɢʜᴏsᴛɢ-x ᴍᴅ* •≫━╾╮\n` +
                        `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${senderId.split('@')[0]}\n` +
                        `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n` +
                        `┃ *ᴠᴇʀsɪᴏɴ* : 1.0.0 (ᴍᴅ)\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                        `💡 *ᴀsᴛᴜᴄᴇ :*\n` +
                        `ᴘᴏᴜʀ ᴄᴏᴍᴘʀᴇɴᴅʀᴇ ᴜɴ sᴏʀᴛ sᴘᴇ́ᴄɪғɪǫᴜᴇ, ᴛᴀᴘᴇ :\n` +
                        `👉🏾 \`${prefix}help <nom_du_sort>\`\n\n` +
                        `🌐 *ʟɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ :*\n` +
                        `• *ᴄʜᴀɪɴᴇ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
                        `• *ᴍᴀɪᴛʀᴇ* : https://wa.me/22651622652\n\n` +
                        `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(chatId, { 
        text: generalHelp,
        mentions: [senderId]
      }, { quoted: msg });

    } catch (err) {
      console.error('help.js error:', err);
      await reply(`*❌ ${toSmallCaps('erreur dans le grimoire d\'aide')}.*`);
    }
  }
};
