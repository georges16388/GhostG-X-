/**
 * WELCOME COMMAND - AGM SYSTEM CORE
 * ENABLE/DISABLE AUTO-GREET SYSTEM
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const db = require('../../database');

// --- DESIGN STATUS AGM (LABELS FIXES) ---
const WELCOME_STATUS_DESIGN = (status) => {
  const sLabel = status === 'on' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ';
  return `*╭╼━≪• ᴡᴇʟᴄᴏᴍᴇ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* ⚙️ *sᴛᴀᴛᴜs* : *${sLabel}*
*┃* 👥 *ᴛᴀʀɢᴇᴛ* : *ɴᴇᴡ ᴍᴇᴍʙᴇʀs*
*┃* 👋 *ᴀᴄᴛɪᴏɴ* : *ᴀᴜᴛᴏ-ɢʀᴇᴇᴛ*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff'],
  category: 'admin',
  description: 'Activer ou désactiver les messages de bienvenue.',
  usage: '.welcome on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const action = args[0]?.toLowerCase();
      const settings = db.getGroupSettings(from) || {};

      // --- AFFICHAGE DU STATUT SI PAS D'ARGUMENT ---
      if (!action || !['on', 'off'].includes(action)) {
        const statusStr = settings.welcome ? 'on' : 'off';
        const currentMsg = settings.welcomeMessage || "ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇꜰɪɴɪ";
        
        await react('ℹ️');
        return reply(
          `${WELCOME_STATUS_DESIGN(statusStr)}\n\n` +
          `📝 *ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ :*\n${currentMsg}\n\n` +
          `💡 *ᴜsᴀɢᴇ :*\n` +
          `  > *.ᴡᴇʟᴄᴏᴍᴇ ᴏɴ*\n` +
          `  > *.ᴡᴇʟᴄᴏᴍᴇ ᴏꜰꜰ*\n` +
          `  > *.sᴇᴛᴡᴇʟᴄᴏᴍᴇ <ᴛᴇxᴛᴇ>*`
        );
      }

      // --- MISE À JOUR DU STATUT ---
      const enable = action === 'on';
      db.updateGroupSettings(from, { welcome: enable });
      
      await react(enable ? '✅' : '⚠️');

      return reply(
        `${WELCOME_STATUS_DESIGN(action)}\n\n` +
        `✅ *ʟᴇ sʏsᴛᴇᴍᴇ ᴅᴇ ʙɪᴇɴᴠᴇɴᴜᴇ ᴇsᴛ* *${enable ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ'}* !`
      );

    } catch (error) {
      console.error('[WELCOME ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴀ ᴍᴏᴅɪꜰɪᴄᴀᴛɪᴏɴ*`);
    }
  }
};
