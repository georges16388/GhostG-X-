/**
 * Broadcast System - AGM Global Announcement (Elite Edition)
 * Optimized for Speed & Identity Preservation
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM (BROADCAST DYNAMIQUE) ---
// On affiche ton numéro et le nom du bot pour un rendu ultra-pro
const AGM_BC = (message, sender) => `╭╼━≪• ᴀɢᴍ ʙʀᴏᴀᴅᴄᴀsᴛ •≫━╾╮
┃ ᴛʏᴘᴇ : ɢʟᴏʙᴀʟ ᴀɴɴᴏᴜɴᴄᴇ 📢
┃ ᴀᴜᴛʜᴏʀ : @${sender.split('@')[0]} 👑
┃ sʏsᴛᴇᴍ : ɢʜᴏsᴛɢ-x ᴍᴅ ⚡
┃ ᴍᴇssᴀɢᴇ : ${message}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'broadcast',
  aliases: ['bc', 'diffuse'],
  category: 'owner',
  description: 'Diffuse un message ou un média à tous les groupes où le bot est présent.',
  usage: '.bc <votre message> (ou répondre à une image)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      const sender = extra.sender;
      const text = args.join(' ');
      
      // Détection de message cité (image, vidéo, sticker, etc.)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!text && !quoted) {
        return sock.sendMessage(from, { 
            text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴇssᴀɢᴇ ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴍéᴅɪᴀ (ɪᴍᴀɢᴇ/ᴠɪᴅéᴏ).*' 
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '📡', key: msg.key } });

      // Récupération de la liste de tous les groupes
      const getGroups = await sock.groupFetchAllParticipating();
      const groups = Object.values(getGroups);

      await sock.sendMessage(from, { 
          text: `🚀 *ʟᴀɴᴄᴇᴍᴇɴᴛ ᴅᴇ ʟᴀ ᴅɪғғᴜsɪᴏɴ...*\n👥 ᴄɪʙʟᴇs : ${groups.length} ɢʀᴏᴜᴘᴇs.` 
      }, { quoted: msg });

      let success = 0;
      let failed = 0;

      for (let i = 0; i < groups.length; i++) {
        try {
          const target = groups[i].id;

          if (quoted) {
            // SI C'EST UN MÉDIA : On le transfère tel quel (plus sûr pour le ban)
            await sock.copyNForward(target, msg, true);
          } else {
            // SI C'EST DU TEXTE : On applique le design AGM avec ton numéro
            await sock.sendMessage(target, { 
              text: AGM_BC(text, sender),
              mentions: [sender] 
            });
          }
          
          success++;
          
          // DÉLAI DE SÉCURITÉ (Anti-Spam WhatsApp)
          // On attend 1.2s entre chaque envoi pour rester sous le radar
          await new Promise(res => setTimeout(res, 1200)); 
          
        } catch (err) {
          console.error(`Erreur d'envoi vers ${groups[i].id}:`, err);
          failed++;
        }
      }

      // RAPPORT FINAL DE DIFFUSION
      const report = `╭╼━≪• ʙᴄ ʀᴇᴘᴏʀᴛ •≫━╾╮\n` +
                     `┃ ✅ sᴜᴄᴄᴇss : ${success}\n` +
                     `┃ ❌ ғᴀɪʟᴇᴅ : ${failed}\n` +
                     `┃ 👥 ᴛᴏᴛᴀʟ : ${groups.length}\n` +
                     `╰━━━━━━━━━━━━━━━╯\n> ᴅɪғғᴜsɪᴏɴ ᴛᴇʀᴍɪɴéᴇ ᴀᴠᴇᴄ sᴜᴄᴄès.`;

      await sock.sendMessage(from, { text: report }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('CRITICAL BC ERROR:', error);
      await sock.sendMessage(extra.from, { 
          text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛéᴍᴇ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
