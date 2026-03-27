/**
 * ᴡᴀʀɴ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴍᴀɴᴀɢᴇ ᴜsᴇʀ ᴅɪsᴄɪᴘʟɪɴᴇ ᴡɪᴛʜ ᴀᴜᴛᴏ-ᴋɪᴄᴋ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ᴅᴀᴛᴀʙᴀsᴇ = require('../../database');
const ᴄᴏɴꜰɪɢ = require('../../config');

// --- ᴅᴇsɪɢɴ ᴀɢᴍ ---
const ᴀɢᴍ_ᴡᴀʀɴ = (ᴜsᴇʀ, ʀᴇᴀsᴏɴ, ᴄᴏᴜɴᴛ, ᴍᴀx) => `╭╼━≪• *ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴡᴀʀɴ* •≫━╾╮
┃ 👤 *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ :* @${ᴜsᴇʀ.sᴘʟɪᴛ('@')[0]}
┃ 📝 *ʀᴀɪsᴏɴ :* ${ʀᴇᴀsᴏɴ}
┃ ⚠️ *ᴡᴀʀɴɪɴɢs :* ${ᴄᴏᴜɴᴛ} / ${ᴍᴀx}
┃ 🛡️ *sᴛᴀᴛᴜs :* ${ᴄᴏᴜɴᴛ >= ᴍᴀx ? '🚫 ᴇxᴘᴜʟsɪᴏɴ' : '🟡 ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛ'}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'warn',
  aliases: ['warning', 'avertir'],
  category: 'admin',
  description: 'ᴀᴠᴇʀᴛɪʀ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ. ʟ\'ᴇxᴘᴜʟsᴇ ᴀᴘʀᴇ̀s ʟᴀ ʟɪᴍɪᴛᴇ.',
  usage: '.ᴡᴀʀɴ @ᴜsᴇʀ <ʀᴀɪsᴏɴ>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata, isBotAdmin }) {
    try {
      let ᴛᴀʀɢᴇᴛ;
      const ǫᴜᴏᴛᴇᴅ = msg.message?.extendedTextMessage?.contextInfo;
      
      // 1. ᴇxᴛʀᴀᴄᴛɪᴏɴ ᴅᴜ ᴊɪᴅ (ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇᴘʟʏ)
      if (ǫᴜᴏᴛᴇᴅ?.participant) {
        ᴛᴀʀɢᴇᴛ = ǫᴜᴏᴛᴇᴅ.participant;
      } else if (ǫᴜᴏᴛᴇᴅ?.mentionedJid && ǫᴜᴏᴛᴇᴅ.mentionedJid.length > 0) {
        ᴛᴀʀɢᴇᴛ = ǫᴜᴏᴛᴇᴅ.mentionedJid[0];
      }

      if (!ᴛᴀʀɢᴇᴛ) {
        return reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ.*');
      }

      // 2. sᴇ́ᴄᴜʀɪᴛᴇ́ : ɪᴍᴘᴏssɪʙʟᴇ ᴅ'ᴀᴠᴇʀᴛɪʀ ᴜɴ ᴀᴅᴍɪɴ
      const ɪsᴀᴅᴍɪɴ = groupMetadata.participants.find(p => p.id === ᴛᴀʀɢᴇᴛ && (p.admin === 'admin' || p.admin === 'superadmin'));
      if (ɪsᴀᴅᴍɪɴ) {
        return reply('❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅ\'ᴀᴠᴇʀᴛɪʀ ᴜɴ ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴇᴜʀ.*');
      }

      await react('⚠️');
      
      const ʀᴇᴀsᴏɴ = args.join(' ') || 'ᴀᴜᴄᴜɴᴇ ʀᴀɪsᴏɴ sᴘᴇ́ᴄɪꜰɪᴇ́ᴇ';
      const ᴍᴀxᴡᴀʀɴs = ᴄᴏɴꜰɪɢ.maxWarnings || 3;
      
      // 3. ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴅᴀɴs ʟᴀ ʙᴀsᴇ ᴅᴇ ᴅᴏɴɴᴇ́ᴇs
      const ᴡᴀʀɴɪɴɢs = ᴅᴀᴛᴀʙᴀsᴇ.addWarning(from, ᴛᴀʀɢᴇᴛ, ʀᴇᴀsᴏɴ);

      // 4. ᴇɴᴠᴏɪ ᴅᴜ ʀᴀᴘᴘᴏʀᴛ
      await sock.sendMessage(from, {
        text: ᴀɢᴍ_ᴡᴀʀɴ(ᴛᴀʀɢᴇᴛ, ʀᴇᴀsᴏɴ, ᴡᴀʀɴɪɴɢs.count, ᴍᴀxᴡᴀʀɴs),
        mentions: [ᴛᴀʀɢᴇᴛ]
      }, { quoted: msg });

      // 5. ɢᴇsᴛɪᴏɴ ᴅᴇ ʟ'ᴇxᴘᴜʟsɪᴏɴ (ᴋɪᴄᴋ)
      if (ᴡᴀʀɴɪɴɢs.count >= ᴍᴀxᴡᴀʀɴs) {
        if (isBotAdmin) {
          await sock.sendMessage(from, { text: `🚫 *ʟɪᴍɪᴛᴇ ᴀᴛᴛᴇɪɴᴛᴇ ᴘᴏᴜʀ @${ᴛᴀʀɢᴇᴛ.sᴘʟɪᴛ('@')[0]}. ᴇxᴘᴜʟsɪᴏɴ ᴇɴ ᴄᴏᴜʀs...*`, mentions: [ᴛᴀʀɢᴇᴛ] });
          await sock.groupParticipantsUpdate(from, [ᴛᴀʀɢᴇᴛ], 'remove');
          ᴅᴀᴛᴀʙᴀsᴇ.clearWarnings(from, ᴛᴀʀɢᴇᴛ);
        } else {
          await reply('⚠️ *ʟɪᴍɪᴛᴇ ᴀᴛᴛᴇɪɴᴛᴇ, ᴍᴀɪs ᴊᴇ ɴᴇ sᴜɪs ᴘᴀs ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴇxᴘᴜʟsᴇʀ.*');
        }
      }

    } catch (ᴇʀʀᴏʀ) {
      console.error('[ᴡᴀʀɴ ᴇʀʀᴏʀ]:', ᴇʀʀᴏʀ);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${ᴇʀʀᴏʀ.ᴍᴇssᴀɢᴇ}`);
    }
  }
};
