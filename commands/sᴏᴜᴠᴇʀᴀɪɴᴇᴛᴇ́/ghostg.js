/**
 * ɢʜᴏsᴛɢ-x ᴍᴅ - Interrupteur Intelligence Artificielle
 * Version : Prestige V5.2 - Light Version
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
    name: 'ɢʜᴏsᴛɢ',
    aliases: ['ghostg', 'intel', 'botai'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    ownerOnly: true,
    description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴜᴛɪʟɪsᴇ ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɴʟᴘ ɪɴᴛᴇʟʟɪɢᴇɴᴛ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴛᴇs ᴏʀᴅʀᴇs sᴀɴs ᴘʀᴇ́ғɪxᴇ**',
    usage: `${prefix}ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ`,

    async execute(sock, msg, args, extra) {
        const { reply, react, isOwner } = extra;
        const firstWord = args && args[0] ? args[0].toLowerCase() : "";

        // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
        if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴇ́ᴠᴇɪʟʟᴇʀ ʟ\'ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ.*');

        const isCurrentlyOn = global.ghostgMode === 'on';

        // Cas 1 : Activation du mode NLP
        if (firstWord === 'on') {
            if (isCurrentlyOn) {
                return reply('*🧠 ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɢʜᴏsᴛɢ ɪɴᴛᴇʟ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*');
            }
            global.ghostgMode = 'on';
            await react('🧠');
            return reply(`🟢 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴀᴄᴛɪᴠᴇ́. ᴊᴇ ᴛ'ᴇ́ᴄᴏᴜᴛᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // Cas 2 : Désactivation du mode NLP
        if (firstWord === 'off') {
            if (!isCurrentlyOn) {
                return reply('*💤 ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɢʜᴏsᴛɢ ɪɴᴛᴇʟ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴇɴ ᴠᴇɪʟʟᴇ.*');
            }
            global.ghostgMode = 'off';
            await react('💤');
            return reply(`💡 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴍɪs ᴇɴ ᴠᴇɪʟʟᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // Cas par défaut : Affichage du statut
        const modeStatus = isCurrentlyOn ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
        return reply(`🤖 *ɢʜᴏsᴛɢ ᴄᴏɴᴛʀᴏʟ : ${modeStatus}*\n*ᴜsᴀɢᴇ : ${prefix}ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
};
