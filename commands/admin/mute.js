/**
 * Mute Command - Close group (only admins can send)
 */

// Design pour la fermeture du groupe
const MUTE_DESIGN = `╭╼━≪• ɢʀᴏᴜᴘ ᴍᴜᴛᴇᴅ •≫━╾╮
┃ sᴛᴀᴛᴜs : ᴄʟᴏsᴇᴅ 🔒
┃ ᴀᴄᴄᴇss : ᴀᴅᴍɪɴs ᴏɴʟʏ 🛡️
┃ ɴᴏᴛᴇ : ᴍsɢ ᴅɪsᴀʙʟᴇᴅ
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
    name: 'mute',
    aliases: ['close', 'closegroup'],
    category: 'admin',
    description: 'Close group (only admins can send messages)',
    usage: '.mute',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        // Change le paramètre du groupe pour 'announcement' (Admins uniquement)
        await sock.groupSettingUpdate(extra.from, 'announcement');
        
        // Envoie le message avec ton design signature
        await extra.reply(MUTE_DESIGN);
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
