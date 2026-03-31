/**
 * Omnipresence Command - GhostG-X Edition
 * Transmet un message à toutes les âmes (chats privés) enregistrées sur le compte WhatsApp
 */

const config = require('../../config.js');

module.exports = {
    name: 'omnipresence',
    aliases: ['diffusion', 'bc', 'oracle'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    description: 'ᴅɪғғᴜsᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs (ᴅᴍ) ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    usage: '.omnipresence <message>',
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
      try {
        // 1. SÉCURITÉ ABSOLUE SUPREME OWNER
        const supremeOwner = '22651622652';
        const senderNumber = extra.sender.replace(/\D/g, ''); 

        // On vérifie si l'expéditeur est bien le détenteur du numéro spécifié
        const isSupreme = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);

        if (!isSupreme) {
          return extra.reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
        }

        // 2. VÉRIFICATION DU MESSAGE
        if (args.length === 0) {
          return extra.reply(
            `*ᴜsᴀɢᴇ : .ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ <ᴍᴇssᴀɢᴇ>*\n\n` +
            `*ᴇxᴇᴍᴘʟᴇ : .ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ sᴀʟᴜᴛ ᴀ̀ ᴛᴏᴜs !*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        }

        const messageText = args.join(' ');

        // 3. RÉCUPÉRATION DES CHATS PRÉSERVES DANS LE COMPTE WHATSAPP
        // sock.chats contient la liste des conversations ouvertes sur ton compte WhatsApp
        const chats = sock.chats || {}; 
        const allJids = Object.keys(chats);

        // On filtre pour ne garder que les messages privés humains
        const privateChats = allJids.filter(jid => jid && jid.endsWith('@s.whatsapp.net'));

        if (privateChats.length === 0) {
          return extra.reply('*〆 ᴀᴜᴄᴜɴᴇ ᴀ̂ᴍᴇ ᴛʀᴏᴜᴠᴇ́ᴇ ᴅᴀɴs ʟᴇ ᴘᴀssᴇ́ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*');
        }

        await extra.reply(`*🔮 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs sᴜʀ ${privateChats.length} ᴀ̂ᴍᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ...*`);

        let success = 0;
        let failed = 0;

        // 4. DIFFUSION DU MESSAGE
        for (const jid of privateChats) {
          try {
            await sock.sendMessage(jid, {
              text: `*╭╼━━━≪• ᴘᴀʀᴏʟᴇ ᴅᴇ ʟ\'ᴏʀᴀᴄʟᴇ •≫━━━╾╮*\n\n` +
                    `${messageText}\n\n` +
                    `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                    `_📩 ᴄᴇᴄɪ ᴇsᴛ ᴜɴᴇ ᴅɪғғᴜsɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴅᴜ ᴍᴀɪ̂ᴛʀᴇ ᴅᴇ ɢʜᴏsᴛɢ-x._\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
            });
            success++;

            // Sécurité anti-spam : WhatsApp déteste les envois massifs en une seconde
            // On laisse une pause aléatoire entre 2 et 4 secondes entre chaque message
            const randomDelay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
            
          } catch (e) {
            console.error(`Échec pour ${jid}:`, e.message);
            failed++;
          }
        }

        await extra.reply(
          `*✅ ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ ᴛᴇʀᴍɪɴᴇ́ᴇ !*\n\n` +
          `*⚔️ sᴜᴄᴄᴇ̀s : ${success}*\n` +
          `*〆 ᴇ́ᴄʜᴇᴄs : ${failed}*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );

      } catch (error) {
        await extra.reply(`*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇɴᴄᴏɴᴛʀᴇ́ ᴜɴᴇ ᴇʀʀᴇᴜʀ : ${error.message}*`);
      }
    }
};
