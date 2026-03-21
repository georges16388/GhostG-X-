/**
 * Owner Command - AGM Prestige Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (name) => `╭╼━≪• ᴏᴡɴᴇʀ ᴄᴏɴᴛᴀᴄᴛ •≫━╾╮
┃ ɴᴀᴍᴇ : ${name}
┃ sᴛᴀᴛᴜs : 🟢 ᴏɴʟɪɴᴇ
┃ ʀᴏʟᴇ : ᴅᴇᴠᴇʟᴏᴘᴇʀ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
    name: 'owner',
    aliases: ['creator', 'dev', 'botowner'],
    category: 'essentials',
    description: 'Show bot owner contact information',
    usage: '.owner',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            const myNumber = "22651622652"; // Ton numéro configuré
            const myName = config.ownerName || "ɢʜᴏsᴛɢ 𝐗";

            // --- GÉNÉRATION DE LA VCARD (CONTACT) ---
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:${myName}\n` +
                `ORG:-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ;\n` +
                `TEL;type=CELL;type=VOICE;waid=${myNumber}:+${myNumber}\n` +
                'END:VCARD';

            // Envoi du contact cliquable
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: myName,
                    contacts: [{ vcard }]
                }
            }, { quoted: msg });

            // Envoi du cadre de confirmation AGM
            await extra.reply(AGM_DESIGN(myName.toUpperCase()));

            // Réaction de respect
            await sock.sendMessage(chatId, { react: { text: "👑", key: msg.key } });

        } catch (error) {
            console.error('Owner command error:', error);
            await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
        }
    }
};
