/**
 * Owner Command - AGM Prestige Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (name) => `*╭╼━≪• *ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ᴄᴏɴᴛᴀᴄᴛ* •≫━╾╮*
*┃* *ɴᴀᴍᴇ* : ${name}
*┃* *sᴛᴀᴛᴜs* : 🟢 ᴏɴʟɪɴᴇ
*┃* *ʀᴏʟᴇ* : ᴅᴇᴠᴇʟᴏᴘᴇʀ ⚡
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
    name: 'dev',
    aliases: ['creator','botdev'],
    category: 'essentials',
    description: 'Afficher les informations du propriétaire du bot',
    usage: '.owner',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        const chatId = msg.key.remoteJid; // Plus sûr que extra.from

        try {
            // Récupération dynamique depuis la config ou valeur par défaut
            const myNumber = "22651622652"; 
            const myName = config.ownerName || "ɢʜᴏsᴛɢ 𝐗";

            // --- GÉNÉRATION DE LA VCARD (Format Baileys ^6.0+) ---
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:${myName}\n` +
                `ORG:ɢʜᴏsᴛɢ 𝐗 ᴘʀᴇsᴛɪɢᴇ;\n` +
                `TEL;type=CELL;type=VOICE;waid=${myNumber}:+${myNumber}\n` +
                'END:VCARD';

            // 1. Envoi du contact cliquable (Format corrigé)
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: myName,
                    contacts: [{ vcard }]
                }
            }, { quoted: msg });

            // 2. Envoi du cadre de confirmation AGM
            // Utilisation de sock.sendMessage au cas où extra.reply échoue
            await sock.sendMessage(chatId, { 
                text: AGM_DESIGN(myName.toUpperCase()) 
            }, { quoted: msg });

            // 3. Réaction de respect
            await sock.sendMessage(chatId, { react: { text: "👑", key: msg.key } });

        } catch (error) {
            console.error('Owner command error:', error);
            const errorMsg = `❌ ᴇʀʀᴇᴜʀ : ${error.message}`;
            await sock.sendMessage(chatId, { text: errorMsg }, { quoted: msg });
        }
    }
};
