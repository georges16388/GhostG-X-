/**
 * Help Command - Show detailed help for a specific command
 */

const { loadCommands } = require('../../utils/commandLoader');
const config = require('../../config.js');

function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'ʜᴇʟᴘ',
  aliases: ['h', 'aide', 'l'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴀꜰꜰɪᴄʜᴇ ʟᴇꜱ ᴅᴇ́ᴛᴀɪʟꜱ ᴇᴛ ʟ\'ᴜᴛɪʟɪꜱᴀᴛɪᴏɴ ᴅ\'ᴜɴᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ꜱᴘᴇ́ᴄɪꜰɪQᴜᴇ**',
  usage: 'ʜᴇʟᴘ',

  async execute(sock, msg, args, extra) {
    try {
      const prefix = config.prefix || '.';
      const commands = loadCommands();
      const pushName = msg.pushName || 'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ';

      // --- CAS 1 : AIDE SPÉCIFIQUE ---
      if (args.length > 0) {
        let search = args[0].toLowerCase();
        let targetCmd = null;

        commands.forEach((cmd) => {
          if (cmd.name.toLowerCase() === search || (cmd.aliases && cmd.aliases.includes(search))) {
            targetCmd = cmd;
          }
        });

        if (!targetCmd) {
          return await extra.reply(`❌ *ᴄᴏᴍᴍᴀɴᴅᴇ \`${args[0]}\` ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ.*`);
        }

        let helpDetail = `╭╼━≪• *${toSmallCaps('aide rituel')}* •≫━╾╮\n` +
                         `┃ 🔮 *sᴏʀᴛ* : ${toSmallCaps(targetCmd.name).toUpperCase()}\n` +
                         `┃ 🏷️ *ᴀʟɪᴀs* : ${targetCmd.aliases ? targetCmd.aliases.join(', ') : 'Aucun'}\n` +
                         `┃ *ᴄᴀᴛᴇ́ɢᴏʀɪᴇ* : ${targetCmd.category || '🔮 ᴀᴜᴛʀᴇs sᴏʀᴛs'}\n` +
                         `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                         `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n_${targetCmd.description || 'Aucune description disponible.'}_\n\n` +
                         `💡 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n*${prefix}${targetCmd.name}* ${targetCmd.usage || ''}\n\n` +
                         `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n` +
                         `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

        return await extra.reply(helpDetail);
      }

      // --- CAS 2 : AIDE GÉNÉRALE ---
      let generalHelp = `╭╼━≪• *ɢʜᴏsᴛɢ-x ᴍᴅ* •≫━╾╮\n` +
                        `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${pushName}\n` +
                        `┃ *ᴘʀᴇ́ғɪxᴇ* : [ ${prefix} ]\n` +
                        `┃ *ᴠᴇʀsɪᴏɴ* : 1.0.0 (ᴍᴅ)\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                        `💡 *ᴀsᴛᴜᴄᴇ :*\n` +
                        `ᴘᴏᴜʀ ᴄᴏᴍᴘʀᴇɴᴅʀᴇ ᴜɴ sᴏʀᴛ sᴘᴇ́ᴄɪғɪǫᴜᴇ, ᴛᴀᴘᴇ :\n` +
                        `👉🏾 \`${prefix}help <nom_du_sort>\`\n\n` +
                        `🌐 *ʟɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ :*\n` +
                        `• *ᴄʜᴀɪ̂ɴᴇ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
                        `• *ᴍᴀɪ̂ᴛʀᴇ* : https://wa.me/22651622652\n\n` +
                        `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(msg.key.remoteJid, { 
        text: generalHelp,
        mentions: [extra.sender]
      }, { quoted: msg });

    } catch (err) {
      console.error('help.js error:', err);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴀɴs ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴅ'ᴀɪᴅᴇ.*`);
    }
  }
};
