/**
 * SETWELCOME COMMAND - AGM SYSTEM CORE
 * CUSTOMIZE WELCOME MESSAGE TEXT
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const db = require('../../database');

// --- DESIGN SETTINGS AGM (LABELS FIXES) ---
const SETWELCOME_DESIGN = (preview) => `*╭╼━≪• ᴡᴇʟᴄᴏᴍᴇ sᴇᴛᴛɪɴɢ •≫━╾╮*
*┃*
*┃* ✅ *sᴛᴀᴛᴜs* : *ᴜᴘᴅᴀᴛᴇᴅ*
*┃* 📝 *ᴛʏᴘᴇ* : *ᴄᴜsᴛᴏᴍ ᴛᴇxᴛ*
*┃* 👀 *ᴘʀᴇᴠɪᴇᴡ* : *${preview}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'setwelcome',
  aliases: ['welcometext', 'changewelcome'],
  category: 'admin',
  description: 'Modifier le message de bienvenue du groupe.',
  usage: '.setwelcome <texte>',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const newText = args.join(' ');
      const settings = db.getGroupSettings(from) || {};

      // --- AFFICHAGE DE L'AIDE SI VIDE ---
      if (!newText) {
        await react('ℹ️');
        const currentMsg = settings.welcomeMessage || "ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇꜰɪɴɪ";
        return reply(
          `📝 *ᴍᴇssᴀɢᴇ ᴅᴇ ʙɪᴇɴᴠᴇɴᴜᴇ ᴀᴄᴛᴜᴇʟ :*\n\n${currentMsg}\n\n` +
          `💡 *ᴠᴀʀɪᴀʙʟᴇs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `  > *@user* : ᴄɪᴛᴇ ʟᴇ ᴍᴇᴍʙʀᴇ\n` +
          `  > *#memberCount* : ɴᴏᴍʙʀᴇ ᴅᴇ ᴍᴇᴍʙʀᴇs\n` +
          `  > *#time* : ʜᴇᴜʀᴇ ᴀᴄᴛᴜᴇʟʟᴇ`
        );
      }

      // --- SÉCURITÉ LONGUEUR ---
      if (newText.length > 500) {
        return reply('❌ *ᴍᴇssᴀɢᴇ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀx 500 ᴄᴀʀᴀᴄᴛᴇʀᴇs).*');
      }

      await react('✍️');

      // --- MISE À JOUR DB ---
      db.updateGroupSettings(from, { 
        welcomeMessage: newText,
        welcome: true 
      });

      // --- GÉNÉRATION DE L'APERÇU ---
      const previewText = newText
        .replace('@user', '@' + (msg.key.participant || from).split('@')[0])
        .replace('#memberCount', '150')
        .replace('#time', new Date().toLocaleTimeString());

      return reply(SETWELCOME_DESIGN(previewText), { mentions: [msg.key.participant || from] });

    } catch (error) {
      console.error('[SETWELCOME ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴀ ᴍᴏᴅɪꜰɪᴄᴀᴛɪᴏɴ*`);
    }
  }
};
