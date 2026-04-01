/**
 * Ping Command - Check bot response time
 * Nom d'invocation : .ᴠɪᴛᴇssᴇ
 */

// Fonction pour convertir du texte normal en Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
    name: 'ᴠɪᴛᴇssᴇ',
    aliases: ['ping', 'p', 'flux', 'latence', 'vitesse'],
    category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: 'Mesure la vitesse de réaction de l\'entité',
    usage: '.ᴠɪᴛᴇssᴇ',
    
    async execute(sock, msg, args, extra) {
      try {
        const start = Date.now();
        const sent = await extra.reply('🔮 *ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴜ ғʟᴜx...*');
        const end = Date.now();
        
        const responseTime = end - start;
        const timeStr = toSmallCaps(`${responseTime} ms`);
        
        const textDesign = `╭╼━≪• *⚡ ᴍᴇsᴜʀᴇ ᴅᴜ ғʟᴜx* •≫━╾╮\n` +
                           `┃\n` +
                           `┃ 📡 *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                           `┃ ⏳ *ʟᴀᴛᴇɴᴄᴇ* : ${timeStr}\n` +
                           `┃ 🧩 *ғʟᴜx* : ᴀᴄᴛɪғ ᴇᴛ sᴛᴀʙʟᴇ\n` +
                           `┃\n` +
                           `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                           `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
                           `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        // On édite le message précédent avec le nouveau style complet
        await sock.sendMessage(extra.from, {
          text: textDesign,
          edit: sent.key
        });
        
      } catch (error) {
        console.error('[vitesse] ERROR:', error);
        await extra.reply(`❌ *ʟ'ᴀɴᴀʟʏsᴇ ᴅᴜ ғʟᴜx ᴀ ᴇ́ᴄʜᴏᴜᴇ́.*`);
      }
    }
};
