/**
 * Omnipresence Command - GhostG-X Edition
 * Transmet un message à toutes les âmes (chats privés) ayant interagi avec le bot
 */

module.exports = {
    name: 'ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ',
    aliases: ['omnipresence', 'bc', 'diffusion', 'oracle'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    description: 'ᴅɪғғᴜsᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs (ᴅᴍ) ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    usage: '.ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ <ᴍᴇssᴀɢᴇ>',
    ownerOnly: true,
    
    async execute(sock, msg, args, extra) {
      try {
        // 1. SÉCURITÉ ABSOLUE SUPREME OWNER
        const supremeOwner = '22651622652';
        const senderNumber = extra.sender.replace(/\D/g, ''); // On ne garde que les chiffres pour comparer proprement
        
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
        
        const message = args.join(' ');
        
        // 3. RÉCUPÉRATION DES CHATS VIA LE STORE
        // On importe le store depuis ton fichier principal (index.js)
        const { store } = require('../../index.js'); 
        
        if (!store || !store.messages) {
          return extra.reply('*〆 ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ (sᴛᴏʀᴇ) ɴ\'ᴇsᴛ ᴘᴀs ᴇɴᴄᴏʀᴇ ᴘʀᴇ̂ᴛ ᴏᴜ ᴇsᴛ ᴠɪᴅᴇ.*');
        }

        // On récupère tous les JID (identifiants de discussion) stockés dans la mémoire vive
        const allJids = Array.from(store.messages.keys());
        
        // On ne garde QUE les numéros privés (on jette les groupes @g.us)
        const privateChats = allJids.filter(jid => jid && jid.endsWith('@s.whatsapp.net'));
        
        if (privateChats.length === 0) {
          return extra.reply('*〆 ᴀᴜᴄᴜɴᴇ ᴀ̂ᴍᴇ ᴇɴʀᴇɢɪsᴛʀᴇ́ᴇ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ.*');
        }

        await extra.reply(`*🔮 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs sᴜʀ ${privateChats.length} ᴄᴏɴᴛᴀᴄᴛs...*`);

        let success = 0;
        let failed = 0;
        
        // 4. DIFFUSION DU MESSAGE
        for (const jid of privateChats) {
          try {
            await sock.sendMessage(jid, {
              text: `*╭╼━━━≪• ᴘᴀʀᴏʟᴇ ᴅᴇ ʟ\'ᴏʀᴀᴄʟᴇ •≫━━━╾╮*\n\n` +
                    `${message}\n\n` +
                    `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                    `_📩 ᴄᴇᴄɪ ᴇsᴛ ᴜɴᴇ ᴅɪғғᴜsɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴅᴜ ᴍᴀɪ̂ᴛʀᴇ ᴅᴇ ɢʜᴏsᴛɢ-x._\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
            });
            success++;
            
            // On monte le délai à 2 secondes pour être totalement invisible face aux radars anti-spam de WhatsApp
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (e) {
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
