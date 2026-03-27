/**
 * ᴄʟᴇᴀɴ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴘᴜʀɢᴇ ᴍᴇssᴀɢᴇs ꜰʀᴏᴍ ᴄʜᴀᴛ ᴏʀ sᴘᴇᴄɪꜰɪᴄ ᴜsᴇʀ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- ᴅᴇsɪɢɴ ᴀɢᴍ ---
const ᴀɢᴍ_ᴄʟᴇᴀɴ = (ᴄᴏᴜɴᴛ, ᴛᴀʀɢᴇᴛ) => `╭╼━≪• *ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴄʟᴇᴀɴ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : 🧹 ɴᴇᴛᴛᴏʏᴀɢᴇ
┃ *ᴄɪʙʟᴇ* : ${ᴛᴀʀɢᴇᴛ ? '@' + ᴛᴀʀɢᴇᴛ.sᴘʟɪᴛ('@')[0] : 'ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs'}
┃ *ǫᴜᴀɴᴛɪᴛᴇ́* : ${ᴄᴏᴜɴᴛ} ᴍsɢs
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear', 'del', 'suppr'],
  category: 'admin',
  description: 'sᴜᴘᴘʀɪᴍᴇʀ ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴜ ɢʀᴏᴜᴘᴇ (ᴛᴏᴜs ᴏᴜ ᴘᴀʀ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ).',
  usage: '.ᴄʟᴇᴀɴ <ɴᴏᴍʙʀᴇ>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const ᴄᴏᴜɴᴛ = parseInt(args[0]);
      if (!ᴄᴏᴜɴᴛ || ᴄᴏᴜɴᴛ < 1 || ᴄᴏᴜɴᴛ > 100) {
        return reply('❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍʙʀᴇ ᴠᴀʟɪᴅᴇ (1-100).*');
      }

      // ʀᴇ́ᴄᴜᴘᴇ́ʀᴀᴛɪᴏɴ ᴅᴜ sᴛᴏʀᴇ ᴅᴇᴘᴜɪs ʟ'ɪɴᴅᴇx
      const { store } = require('../../index');
      const ǫᴜᴏᴛᴇᴅᴊɪᴅ = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const ᴍsɢs = store.messages[from];
      if (!ᴍsɢs) {
        return reply('❌ *ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴇɴʀᴇɢɪsᴛʀᴇ́ ᴅᴀɴs ʟᴇ sᴛᴏʀᴇ.*');
      }

      let ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ = [];
      const ᴀʟʟᴍsɢs = Object.values(ᴍsɢs).sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0));

      if (ǫᴜᴏᴛᴇᴅᴊɪᴅ) {
        // mode : supprimer uniquement les messages de l'utilisateur cité
        ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ = ᴀʟʟᴍsɢs.filter(m => (m.key.participant || m.key.remoteJid) === ǫᴜᴏᴛᴇᴅᴊɪᴅ).slice(0, ᴄᴏᴜɴᴛ);
      } else {
        // mode : supprimer les derniers messages du chat
        ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ = ᴀʟʟᴍsɢs.slice(0, ᴄᴏᴜɴᴛ);
      }

      if (ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ.length === 0) {
        return reply('❌ *ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴛʀᴏᴜᴠᴇ́ ᴀ̀ sᴜᴘᴘʀɪᴍᴇʀ.*');
      }

      await react('🧹');
      await reply(ᴀɢᴍ_ᴄʟᴇᴀɴ(ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ.length, ǫᴜᴏᴛᴇᴅᴊɪᴅ));

      for (const m of ᴍᴇssᴀɢᴇsᴛᴏᴅᴇʟᴇᴛᴇ) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          // petit délai pour éviter le spam-ban de whatsapp
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (err) {
          // ignorer les erreurs de suppression (messages trop vieux, etc.)
        }
      }
      
    } catch (ᴇ) {
      console.error('[ᴄʟᴇᴀɴ ᴇʀʀᴏʀ]:', ᴇ);
      reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ɴᴇᴛᴛᴏʏᴀɢᴇ.*');
    }
  }
};
