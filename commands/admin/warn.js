/**
 * Warn Command - AGM System Core
 * Manage user discipline with auto-kick
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');
const config = require('../../config');

// --- DESIGN AGM PRESTIGE (LABELS FIXES) ---
const AGM_WARN = (user, reason, count, max) => {
  const statusLabel = count >= max ? '🚫 ᴇxᴘᴜʟsɪᴏɴ' : '🟡 ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛ';
  return `*╭╼━≪• ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴡᴀʀɴ •≫━╾╮*
*┃* 👤 *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : *@${user.split('@')[0]}*
*┃* 📝 *ʀᴀɪsᴏɴ* : *${reason}*
*┃* ⚠️ *ᴡᴀʀɴɪɴɢs* : *${count} / ${max}*
*┃* 🛡️ *sᴛᴀᴛᴜs* : *${statusLabel}*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'warn',
  aliases: ['warning', 'avertir'],
  category: 'admin',
  description: 'Avertir un utilisateur. L\'expulse après la limite.',
  usage: '.warn @user <raison>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata, isBotAdmin }) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      let target = ctx?.mentionedJid?.[0] || ctx?.participant;

      if (!target) {
        return reply(`⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ*`);
      }

      // --- SÉCURITÉ : ANTI-WARN ADMIN ---
      const isAdmin = groupMetadata.participants.find(p => p.id === target && (p.admin === 'admin' || p.admin === 'superadmin'));
      if (isAdmin) {
        return reply(`❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅ'ᴀᴠᴇʀᴛɪʀ ᴜɴ ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴇᴜʀ*`);
      }

      const reason = args.join(' ') || 'ᴀᴜᴄᴜɴᴇ ʀᴀɪsᴏɴ sᴘᴇᴄɪꜰɪᴇᴇ';
      const maxWarns = config.maxWarnings || 3;

      // --- LOGIQUE BASE DE DONNÉES ---
      const warnings = database.addWarning(from, target, reason);
      
      await react('⚠️');

      // --- ENVOI DU RAPPORT ---
      await sock.sendMessage(from, {
        text: AGM_WARN(target, reason, warnings.count, maxWarns),
        mentions: [target]
      }, { quoted: msg });

      // --- GESTION DE L'EXPULSION ---
      if (warnings.count >= maxWarns) {
        if (isBotAdmin) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await sock.sendMessage(from, { 
            text: `🚫 *ʟɪᴍɪᴛᴇ ᴀᴛᴛᴇɪɴᴛᴇ ᴘᴏᴜʀ @${target.split('@')[0]}. ᴇxᴘᴜʟsɪᴏɴ ᴇɴ ᴄᴏᴜʀs...*`, 
            mentions: [target] 
          });
          await sock.groupParticipantsUpdate(from, [target], 'remove');
          database.clearWarnings(from, target);
        } else {
          await reply(`⚠️ *ʟɪᴍɪᴛᴇ ᴀᴛᴛᴇɪɴᴛᴇ, ᴍᴀɪs ᴊᴇ ɴᴇ sᴜɪs ᴘᴀs ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴇxᴘᴜʟsᴇʀ*`);
        }
      }

    } catch (error) {
      console.error('[WARN ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟ'ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛ*`);
    }
  }
};
