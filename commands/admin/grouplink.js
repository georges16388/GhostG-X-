/**
 * Group Link & Reset Command - AGM Invite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'grouplink',
  aliases: ['link', 'invite', 'revokelink'],
  category: 'admin',
  description: 'Obtenir ou réinitialiser le lien d\'invitation du groupe.',
  usage: '.grouplink | .grouplink reset',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata }) {
    try {
      const isReset = args[0]?.toLowerCase() === 'reset';

      // 1. Action : Réinitialisation si demandée
      if (isReset) {
        await react("🔄");
        await sock.groupRevokeInvite(from);
        // On attend un court instant pour que WhatsApp génère le nouveau code
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 2. Génération/Récupération du lien
      const code = await sock.groupInviteCode(from);
      const link = `https://chat.whatsapp.com/${code}`;
      const groupName = groupMetadata?.subject || "ɢʀᴏᴜᴘ";

      // 3. Construction du Design Prestige
      let design = `*╭╼━≪• ${toStyledCaps(isReset ? 'ʟɪɴᴋ ʀᴇsᴇᴛ sᴜᴄᴄᴇss' : 'ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ')} •≫━╾╮*
*┃*
*┃* 👥 *${toStyledCaps('ɢʀᴏᴜᴘ')}* : *${toStyledCaps(groupName)}*
*┃* 🔗 *${toStyledCaps('ʟɪɴᴋ')}* : ${link}
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(isReset ? 'ɴᴇᴡ ʟɪɴᴋ ᴀᴄᴛɪᴠᴇ' : 'ᴏғғɪᴄɪᴀʟ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*

⚠️ *${toStyledCaps('ɴᴏᴛᴇ')}* : *${toStyledCaps(isReset ? 'ʟᴀɴᴄɪᴇɴ ʟɪᴇɴ ᴀ ᴇᴛᴇ ʀᴇᴠᴏǫᴜᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇs' : 'ɴᴇ ᴘᴀʀᴛᴀɢᴇᴢ ᴘᴀs ᴄᴇ ʟɪᴇɴ ᴘᴜʙʟɪǫᴜᴇᴍᴇɴᴛ')} !*`;

      await react(isReset ? "✅" : "🔗");
      return reply(design);

    } catch (error) {
      console.error('GroupLink Error:', error);
      await reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟ'ᴏᴘᴇʀᴀᴛɪᴏɴ')}*`);
    }
  }
};
