/**
 * Broadcast System - AGM Global Announcement (Ultra-Sync)
 * Diffusion : Groupes + Utilisateurs Privés
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { delay } = require('@whiskeysockets/baileys');

const AGM_BC = (message, sender) => `╭╼━≪• ᴀɢᴍ ʙʀᴏᴀᴅᴄᴀsᴛ •≫━╾╮
┃ ᴛʏᴘᴇ : ɢʟᴏʙᴀʟ ᴀɴɴᴏᴜɴᴄᴇ 📢
┃ ᴀᴜᴛʜᴏʀ : @${sender.split('@')[0]} 
┃ sʏsᴛᴇᴍ : ɢʜᴏsᴛɢ-x ᴍᴅ ⚡
┃ ᴍᴇssᴀɢᴇ : ${message}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'broadcast',
  aliases: ['bc', 'diffuse'],
  category: 'owner',
  description: 'Diffuse à tous les groupes ET tous les contacts privés.',
  usage: '.bc <message>',
  ownerOnly: true,

  async execute(sock, msg, args, { from, sender, reply, react }) {
    try {
      const text = args.join(' ');
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!text && !quoted) {
        return reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴇssᴀɢᴇ ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴍéᴅɪᴀ.*');
      }

      await react('📡');

      // 1. RÉCUPÉRATION DES CIBLES
      // Groupes
      const allGroups = await sock.groupFetchAllParticipating();
      const groups = Object.values(allGroups).map(v => v.id);
      
      // Utilisateurs Privés (depuis le cache des chats)
      const allChats = sock.chats ? Object.keys(sock.chats) : [];
      const privateChats = allChats.filter(id => id.endsWith('@s.whatsapp.net') && id !== sock.user.id.split(':')[0] + '@s.whatsapp.net');

      const totalTargets = [...groups, ...privateChats];

      await reply(`🚀 *ʟᴀɴᴄᴇᴍᴇɴᴛ ɢʟᴏʙᴀʟ...*\n👥 ɢʀᴏᴜᴘᴇs : ${groups.length}\n👤 ᴘʀɪᴠés : ${privateChats.length}`);

      let success = 0;
      let failed = 0;

      for (const target of totalTargets) {
        try {
          if (quoted) {
            // Transfert du média
            await sock.copyNForward(target, msg, true);
          } else {
            // Envoi du texte AGM
            await sock.sendMessage(target, { 
              text: AGM_BC(text, sender),
              mentions: [sender] 
            });
          }

          success++;
          // Délai pour éviter le bannissement (très important ici car plus de cibles)
          await delay(1500); 

        } catch (err) {
          failed++;
        }
      }

      const report = `╭╼━≪• ʙᴄ ꜰɪɴᴀʟ ʀᴇᴘᴏʀᴛ •≫━╾╮\n` +
                     `┃ ✅ sᴜᴄᴄᴇss : ${success}\n` +
                     `┃ ❌ ғᴀɪʟᴇᴅ : ${failed}\n` +
                     `┃ 📊 ᴛᴏᴛᴀʟ : ${totalTargets.length}\n` +
                     `╰━━━━━━━━━━━━━━━╯\n> ᴅɪғғᴜsɪᴏɴ ᴛᴇʀᴍɪɴéᴇ.`;

      await reply(report);
      await react('✅');

    } catch (error) {
      console.error('BC ERROR:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
