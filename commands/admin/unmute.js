/**
 * Unmute Command - AGM Elite Edition
 * Open group (all members can send)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- DESIGN UNMUTE AGM (LABELS FIXES) ---
const UNMUTE_DESIGN = `*╭╼━≪• ɢʀᴏᴜᴘ ᴜɴᴍᴜᴛᴇᴅ •≫━╾╮*
*┃*
*┃* 🔓 *sᴛᴀᴛᴜs* : *ᴏᴘᴇɴᴇᴅ*
*┃* 👥 *ᴀᴄᴄᴇss* : *ᴇᴠᴇʀʏᴏɴᴇ*
*┃* ✅ *ɴᴏᴛᴇ* : *ᴍsɢ ᴇɴᴀʙʟᴇᴅ*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'unmute',
  aliases: ['open', 'opengroup', 'unlock'],
  category: 'admin',
  description: 'Ouvrir le groupe (tout le monde peut envoyer des messages).',
  usage: '.unmute',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      // 1. Mise à jour des paramètres du groupe via Baileys
      await sock.groupSettingUpdate(from, 'not_announcement');

      // 2. Réaction de succès
      await react('🔓');

      // 3. Envoi du design Prestige
      return reply(UNMUTE_DESIGN);

    } catch (error) {
      console.error('Unmute Error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴏᴜᴠᴇʀᴛᴜʀᴇ ᴅᴜ ɢʀᴏᴜᴘᴇ*`);
    }
  }
};
