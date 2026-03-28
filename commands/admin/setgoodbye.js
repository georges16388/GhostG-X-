/**
 * SETGOODBYE COMMAND - AGM SYSTEM CORE
 * CUSTOMIZE GOODBYE MESSAGE TEXT
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const db = require('../../database');

// --- DESIGN SETTINGS AGM (LABELS FIXES) ---
const SETGOODBYE_DESIGN = (preview) => `*╭╼━≪• ɢᴏᴏᴅʙʏᴇ sᴇᴛᴛɪɴɢ •≫━╾╮*
*┃*
*┃* ✅ *sᴛᴀᴛᴜs* : *ᴜᴘᴅᴀᴛᴇᴅ*
*┃* 📝 *ᴛʏᴘᴇ* : *ᴄᴜsᴛᴏᴍ ᴛᴇxᴛ*
*┃* 👀 *ᴘʀᴇᴠɪᴇᴡ* : *${preview}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗`;

module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbyetext', 'changegoodbye'],
  category: 'admin',
  description: 'Modifier le message de départ du groupe.',
  usage: '.setgoodbye <texte>',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const newText = args.join(' ');
      const settings = db.getGroupSettings(from) || {};

      // --- AFFICHAGE DE L'AIDE SI VIDE ---
      if (!newText) {
        await react('ℹ️');
        const currentMsg = settings.goodbyeMessage || "ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇꜰɪɴɪ";
        return reply(
          `📝 *ᴍᴇssᴀɢᴇ ᴅᴇ ᴅᴇᴘᴀʀᴛ ᴀᴄᴛᴜᴇʟ :*\n\n${currentMsg}\n\n` +
          `💡 *ᴠᴀʀɪᴀʙʟᴇs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `  > *@user* : ɴᴏᴍ ᴅᴜ ᴍᴇᴍʙʀᴇ\n` +
          `  > *#memberCount* : ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs\n` +
          `  > *#time* : ʜᴇᴜʀᴇ ᴅᴜ ᴅᴇᴘᴀʀᴛ`
        );
      }

      // --- SÉCURITÉ LONGUEUR ---
      if (newText.length > 500) {
        return reply('❌ *ᴍᴇssᴀɢᴇ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀx 500 ᴄᴀʀᴀᴄᴛᴇʀᴇs).*');
      }

      await react('✍️');

      // --- MISE À JOUR DB ---
      db.updateGroupSettings(from, { 
        goodbyeMessage: newText,
        goodbye: true 
      });

      // --- GÉNÉRATION DE L'APERÇU ---
      const previewText = newText
        .replace('@user', '@' + (msg.key.participant || from).split('@')[0])
        .replace('#memberCount', '100')
        .replace('#time', new Date().toLocaleTimeString());

      return reply(SETGOODBYE_DESIGN(previewText), { mentions: [msg.key.participant || from] });

    } catch (error) {
      console.error('[SETGOODBYE ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴀ ᴍᴏᴅɪꜰɪᴄᴀᴛɪᴏɴ*`);
    }
  }
};
