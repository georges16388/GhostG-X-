/**
 * Add Command - Inviter un membre dans le groupe (avec gestion d'invitation PV)
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'add',
  aliases: ['ajouter', 'inviter', 'a'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴊᴏᴜᴛᴇ ᴜɴ ᴍᴇᴍʙʀᴇ ᴀᴜ ɢʀᴏᴜᴘᴇ ᴏᴜ ʟᴜɪ ᴇɴᴠᴏʏᴇʀ ᴜɴᴇ ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴘʀɪᴠᴇ́ᴇ s\'ɪʟ ᴇsᴛ ʙʟᴏǫᴜᴇ́**',
  usage: `${prefix}add 226XXXXXXXX`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      let targetNumber = args[0];

      // 1. Vérification si un argument (numéro) a été fourni
      if (!targetNumber) {
        return reply(
          `╭╼━≪• *ɪɴᴠᴏᴄᴀᴛɪᴏɴ_ᴅᴇ_ᴍᴇᴍʙʀᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*ᴠᴇᴜɪʟʟᴇᴢ ʀᴇɴsᴇɪɢɴᴇʀ ʟᴇ ɴᴜᴍᴇ́ʀᴏ ᴀ̀ ᴀᴊᴏᴜᴛᴇʀ.*\n\n` +
          `  ${prefix}add 226XXXXXXXX\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      // 2. Nettoyage du numéro (on enlève les +, les espaces et les tirets)
      let cleanedNumber = targetNumber.replace(/[^0-9]/g, '');
      const targetJid = `${cleanedNumber}@s.whatsapp.net`;

      await reply(`⏳ *ᴛᴇɴᴛᴀᴛɪᴠᴇ ᴅ'ᴀsᴘɪʀᴀᴛɪᴏɴ ᴅᴇ ʟ'ᴀ̂ᴍᴇ...*`);

      // 3. Vérification si l'utilisateur est déjà dans le groupe
      const freshMetadata = await sock.groupMetadata(extra.from);
      const isAlreadyInGroup = freshMetadata.participants.some(
        p => p.id === targetJid || p.lid === targetJid
      );

      if (isAlreadyInGroup) {
        return reply(`❌ *ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ ғᴀɪᴛ ᴅᴇ́ᴊᴀ̀ ᴘᴀʀᴛɪᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // 4. Exécution de l'ajout
      const response = await sock.groupParticipantsUpdate(extra.from, [targetJid], 'add');
      const status = response[0]?.status;

      // CAS 1 : Succès total
      if (status === '200') {
        return await sock.sendMessage(extra.from, {
          text: `🎯 *@${cleanedNumber}* ᴀ ᴇ́ᴛᴇ́ ᴀsᴘɪʀᴇ́ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s !\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
          mentions: [targetJid]
        }, { quoted: msg });
      } 

      // CAS 2 : Blocage vie privée (On génère et on envoie l'invitation en PV)
      if (status === '403' || response[0]?.content?.name === 'non-private') {

        // On récupère le code d'invitation du groupe
        let inviteCode;
        try {
          inviteCode = await sock.groupInviteCode(extra.from);
        } catch (e) {
          return reply(`🛡️ *ᴄᴇᴛᴛᴇ ᴇɴᴛɪᴛᴇ́ ᴀ sᴇ́ᴄᴜʀɪsᴇ́ sᴇs ᴘᴀʀᴀᴍᴇ̀ᴛʀᴇs, ᴇᴛ ʟ'ᴏʀᴀᴄʟᴇ ɴ'ᴀ ᴘᴀs ᴘᴜ ɢᴇ́ɴᴇ́ʀᴇʀ ᴅᴇ ʟɪᴇɴ ᴅ'ɪɴᴠɪᴛᴀᴛɪᴏɴ.*`);
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        const groupName = freshMetadata.subject;

        // On construit le message stylisé pour les DM de la cible
        const pvMessage = 
          `╭╼━≪• *ɪɴᴠᴏᴛᴀᴛɪᴏɴ_ᴀᴜ_sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
          `┃ *ɢʀᴏᴜᴘᴇ* : ${groupName}\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 sᴀʟᴜᴛᴀᴛɪᴏɴs, ᴇɴᴛɪᴛᴇ́.* \n` +
          `*ᴜɴ ɢᴀʀᴅɪᴇɴ ᴀ sᴏᴜʜᴀɪᴛᴇ́ ᴛ'ᴀᴊᴏᴜᴛᴇʀ ᴀᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ, ᴍᴀɪs ᴛᴇs ʙᴀʀʀɪᴇ̀ʀᴇs ᴅᴇ sᴇ́ᴄᴜʀɪᴛᴇ́ ʟ'ᴏɴᴛ ᴇᴍᴘᴇ̂ᴄʜᴇ́.*\n\n` +
          `*ᴛᴜ ᴇs ᴄᴏʀᴅɪᴀʟᴇᴍᴇɴᴛ ɪɴᴠɪᴛᴇ́ ᴀ̀ ɴᴏᴜs ʀᴇᴊᴏɪɴᴅʀᴇ ᴠɪᴀ ᴄᴇ ᴘᴏʀᴛᴀɪʟ :*\n\n` +
          `🔗 ${inviteLink}\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

        try {
          // Le bot envoie le message en Inbox à la personne
          await sock.sendMessage(targetJid, { text: pvMessage });

          // Le bot prévient le groupe que l'invitation a été envoyée
          return reply(`🛡️ *ᴄᴇᴛᴛᴇ ᴇɴᴛɪᴛᴇ́ ᴀ sᴇ́ᴄᴜʀɪsᴇ́ sᴇs ᴘᴀʀᴀᴍᴇ̀ᴛʀᴇs. ᴜɴᴇ ɪɴᴠɪᴛᴀᴛɪᴏɴ sᴛʏʟɪsᴇ́ᴇ ʟᴜɪ ᴀ ᴇ́ᴛᴇ́ ᴇɴᴠᴏʏᴇ́ᴇ ᴇɴ ᴘʀɪᴠᴇ́ !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        } catch (pvError) {
          console.error("Erreur d'envoi PV :", pvError);
          return reply(`❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅ'ᴇɴᴠᴏʏᴇʀ ʟ'ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴇɴ ᴘʀɪᴠᴇ́ ᴀ̀ ᴄᴇᴛ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ.*`);
        }
      }

      // CAS 3 : Autres erreurs (numéro banni, n'existe pas, etc.)
      return reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟ'ᴀsᴘɪʀᴀᴛɪᴏɴ. ʟᴇ ɴᴜᴍᴇ́ʀᴏ ᴇsᴛ ᴘᴇᴜᴛ-ᴇ̂ᴛᴇ ɪɴᴠᴀʟɪᴅᴇ (sᴛᴀᴛᴜs ${status}).*`);

    } catch (error) {
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
