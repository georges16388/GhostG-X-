/**
 * Owner Command - GhostG-X Prestige Edition
 * Nom d'invocation : .sᴏᴜᴠᴇʀᴀɪɴ
 */

const config = require('../../config');

module.exports = {
    name: 'sᴏᴜᴠᴇʀᴀɪɴ',
    aliases: ['owner', 'creator', 'dev', 'developpeur' ,'maitre', 'developper','architecte', 'souverain'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: 'Invoque les informations sacrées du Grand Architecte',
    usage: '.sᴏᴜᴠᴇʀᴀɪɴ',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        const chatId = extra.from;

        try {
            // Ton numéro spécifique
            const myNumber = "22651622652"; 
            const myName = config.ownerName || "ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs";

            // --- GÉNÉRATION DE LA VCARD SACRÉE ---
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs\n` +
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
            await extra.reply(`❌ *ʟ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́.*`);
        }
    }
};
