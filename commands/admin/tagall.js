/**
 * Tag All Command - AGM Elite Edition (Full Bold Small Caps + Arrow)
 * Mention all group members with Admin icons
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'tagall',
  aliases: ['mentionall', 'everyone', 'all'],
  category: 'admin',
  description: 'Taguer tous les membres du groupe avec distinction admin.',
  usage: '.tagall <message>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata }) {
    try {
      const participants = groupMetadata?.participants || [];
      const mentions = participants.map(p => p.id);
      const messageText = args.join(' ') || 'ᴀᴛᴛᴇɴᴛɪᴏɴ ᴛᴏᴜᴛ ʟᴇ ᴍᴏɴᴅᴇ !';

      await react('📢');

      // --- CONSTRUCTION DU HEADER PRESTIGE ---
      let text = `*╭╼━≪• ${toStyledCaps('ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ')} •≫━╾╮*\n`;
      text += `*┃*\n`;
      text += `*┃* 📝 *${toStyledCaps('ᴍsɢ')}* : *${toStyledCaps(messageText)}*\n`;
      text += `*┃* 👥 *${toStyledCaps('ᴛᴏᴛᴀʟ')}* : *${participants.length} ${toStyledCaps('ᴍᴇᴍʙᴇʀs')}*\n`;
      text += `*┃*\n`;
      text += `*╰━━━━━━━━━━━━━━━╯*\n\n`;

      // --- CONSTRUCTION DE LA LISTE STYLISÉE ---
      let listText = `*╭╼━━━━━≪ ${toStyledCaps('ᴍᴇᴍʙᴇʀs ʟɪsᴛ')} ≫━━━━━╼╮*\n`;
      
      participants.forEach((mem, index) => {
        const isAdmin = mem.admin === 'admin' || mem.admin === 'superadmin';
        const adminIcon = isAdmin ? ' 🛡️' : '';
        const num = (index + 1).toString().padStart(2, '0'); 
        
        // Liste en gras avec la flèche ➽ et chiffres normaux
        listText += `*┃ ➽ ${num} :* @${mem.id.split('@')[0]}${adminIcon}\n`;
      });

      listText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
      listText += `> ***${toStyledCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x')}***`;

      // --- ENVOI FINAL ---
      await sock.sendMessage(from, { 
        text: text + listText, 
        mentions: mentions 
      }, { quoted: msg });

    } catch (error) {
      console.error('TagAll Error:', error);
      await reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
