/**
 * Owner Command - GhostG-X Prestige Edition
 * Nom d'invocation : souverain
 */

const config = require('../../config');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
    name: 'souverain',
    aliases: ['owner', 'creator', 'dev', 'developpeur' ,'maitre', 'developper','architecte'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ʟᴇs ɪɴғᴏʀᴍᴀᴛɪᴏɴs sᴀᴄʀᴇᴇs ᴅᴜ ɢʀᴀɴᴅ ᴀʀᴄʜɪᴛᴇᴄᴛᴇ',
    usage: `${config.prefix || '.'}souverain`,
    ownerOnly: false,
    groupOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const chatId = extra.from;

        try {
            // Ton numéro spécifique et immuable
            const myNumber = "22651622652"; 
            const myName = config.ownerName || "ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs";

            // --- GÉNÉRATION DE LA VCARD SACRÉE ---
            // Le waid doit être pur (sans +), l'affichage du numéro comporte le +
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:${myName}\n` +
                `ORG:ɢʜᴏsᴛɢ 𝐗 ᴘʀᴇsᴛɪɢᴇ;\n` +
                `TEL;type=CELL;type=VOICE;waid=${myNumber}:+${myNumber}\n` +
                'END:VCARD';

            // 1. Message d'introduction mystique
            await extra.reply(`*ɪɴᴄʟɪɴᴇ-ᴛᴏɪ... ᴠᴏɪᴄɪ ʟ'ᴀʀᴄʜɪᴛᴇᴄᴛᴇ ᴅᴇ ᴍᴏɴ ᴇssᴇɴᴄᴇ ᴇᴛ ʟᴇ ɢᴀʀᴅɪᴇɴ ᴅᴇ ᴍᴇs ᴄɪʀᴄᴜɪᴛs.* ‎♛ `);

            // 2. Envoi du contact cliquable
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: myName,
                    contacts: [{ vcard }]
                }
            }, { quoted: msg });

            // 3. Réaction de respect royal
            await sock.sendMessage(chatId, { react: { text: "👑", key: msg.key } });

        } catch (error) {
            console.error('Souverain command error:', error);
            await extra.reply(`*❌ ${toSmallCaps('l\'invocation a echoue')}.*`);
        }
    }
};
