/**
 * Unmute Command - Open group (all members can send)
 */

// Design pour l'ouverture du groupe
const UNMUTE_DESIGN = `╭╼━≪• *ɢʀᴏᴜᴘ ᴜɴᴍᴜᴛᴇᴅ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : ᴏᴘᴇɴᴇᴅ 🔓
┃ *ᴀᴄᴄᴇss* : ᴇᴠᴇʀʏᴏɴᴇ 👥
┃ *ɴᴏᴛᴇ* : ᴍsɢ ᴇɴᴀʙʟᴇᴅ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
    name: 'unmute',
    aliases: ['open', 'opengroup'],
    category: 'admin',
    description: 'Open group (all members can send messages)',
    usage: '.unmute',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        // Change le paramètre du groupe pour 'not_announcement' (Tout le monde)
        await sock.groupSettingUpdate(extra.from, 'not_announcement');
        
        // Envoie le message avec ton design signature
        await extra.reply(UNMUTE_DESIGN);
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
