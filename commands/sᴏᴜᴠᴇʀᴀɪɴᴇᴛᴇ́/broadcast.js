/**
 * Omnipresence Command - GhostG-X Edition
 * Transmet un message à toutes les âmes maîtresses (Owners) enregistrées sur le bot
 * Sécurité : Supreme Owner Master Access (Invisible Bypass via Hashes)
 */

const config = require('../../config.js');
const crypto = require('crypto');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

// Fonction pour convertir du texte en petites capitales (Smallcaps)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
  return text.split('').map(char => {
    const index = normal.indexOf(char);
    return index !== -1 ? smallCaps[index] : char;
  }).join('');
}

module.exports = {
    name: 'omnipresence',
    aliases: ['diffusion', 'bc', 'oracle'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    ownerOnly: true,
    description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅɪғғᴜsᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs ᴍᴀɪ̂ᴛʀᴇs (ᴏᴡɴᴇʀs) ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ**',
    usage: `${prefix}omnipresence <ᴍᴇssᴀɢᴇ>`,

    async execute(sock, msg, args, extra) {
      const { reply } = extra;
      const chatId = msg.key.remoteJid;

      try {
        // 1. 🔒 SÉCURITÉ ABSOLUE SUPREME OWNER (Par Hash)
        const senderNumber = extra.sender.replace(/\D/g, ''); 
        const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

        // On vérifie si le hash de l'expéditeur est dans ta liste secrète du config.js
        const isSupreme = config.supremeHashes && config.supremeHashes.includes(senderHash);

        if (!isSupreme) {
          return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
        }

        // 2. VÉRIFICATION DU MESSAGE
        if (args.length === 0) {
          return reply(
            `*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ᴍᴇssᴀɢᴇ !*\n\n` +
            `*ᴜsᴀɢᴇ : ${prefix}omnipresence <ᴍᴇssᴀɢᴇ>*\n` +
            `*ᴇxᴇᴍᴘʟᴇ : ${prefix}omnipresence Salut à tous !*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        }

        // Extraction du message et transmutation en Smallcaps
        const rawMessage = args.join(' ');
        const messageText = toSmallCaps(rawMessage);

        // 3. RÉCUPÉRATION DES OWNERS DEPUIS LA CONFIG (Correction vers ownerNumber)
        let ownersList = [];

        if (Array.isArray(config.ownerNumber)) {
          ownersList = config.ownerNumber;
        } else if (typeof config.ownerNumber === 'string') {
          ownersList = config.ownerNumber.split(',').map(num => num.trim());
        }

        // Nettoyage et ciblage WhatsApp (@s.whatsapp.net)
        const targetJids = ownersList
          .map(num => num.replace(/\D/g, ''))
          .filter(num => num.length > 5)
          .map(num => `${num}@s.whatsapp.net`);

        const uniqueJids = [...new Set(targetJids)];

        if (uniqueJids.length === 0) {
          return reply('*〆 ᴀᴜᴄᴜɴᴇ ᴀ̂ᴍᴇ ᴍᴀɪ̂ᴛʀᴇs sᴇ́ʟᴇᴄᴛɪᴏɴɴᴇ́ᴇ ᴅᴀɴs ʟᴀ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ.*');
        }

        await reply(`*🔮 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs sᴜʀ ${uniqueJids.length} ᴀ̂ᴍᴇs ᴍᴀɪ̂ᴛʀᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ...*`);

        let success = 0;
        let failed = 0;

        // 4. DIFFUSION DU MESSAGE
        for (const jid of uniqueJids) {
          try {
            await sock.sendMessage(jid, {
              text: `*╭╼━━━≪•♛ ᴍᴇssᴀɢᴇ ᴅᴜ sᴏᴜᴠᴇʀᴀɪɴ •≫━━━╾╮*\n\n` +
                    `${messageText}\n\n` +
                    `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                    `_📩 ᴄᴇᴄɪ ᴇsᴛ ᴜɴᴇ ᴅɪғғᴜsɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴅᴜ ᴍᴀɪ̂ᴛʀᴇ ᴅᴇ ɢʜᴏsᴛɢ-x._\n\n` +
                    `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
            });
            success++;

            // Sécurité anti-spam : Pause aléatoire entre 2 et 3 secondes
            const randomDelay = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
            await new Promise(resolve => setTimeout(resolve, randomDelay));

          } catch (e) {
            console.error(`Échec pour ${jid}:`, e.message);
            failed++;
          }
        }

        await reply(
          `*✅ ᴏᴍɴɪᴘʀᴇsᴇɴᴄᴇ ᴛᴇʀᴍɪɴᴇ́ᴇ !*\n\n` +
          `*⚔️ sᴜᴄᴄᴇ̀s : ${success}*\n` +
          `*〆 ᴇ́ᴄʜᴇᴄs : ${failed}*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );

      } catch (error) {
        console.error('Error in omnipresence command:', error);
        await reply(`*〆 ʟ'ᴏʀᴀᴄʟᴇ ᴀ ᴇɴᴄᴏɴᴛʀᴇ́ ᴜɴᴇ ᴇʀʀᴇᴜʀ : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }
    }
};
