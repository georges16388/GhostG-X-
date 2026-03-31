/**
 * ɢʜᴏsᴛɢ-x ᴍᴅ - Interrupteur Intelligence Artificielle
 * Version : Prestige V5.2 - Light Version
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');

module.exports = {
    name: 'ɢʜᴏsᴛɢ',
    aliases: ['ghostg', 'intel', 'botai'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    description: 'sʏsᴛᴇ̀ᴍᴇ ɴʟᴘ ɪɴᴛᴇʟʟɪɢᴇɴᴛ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴅᴇs ᴏʀᴅʀᴇs sᴀɴs ᴘʀᴇ́ғɪxᴇ',
    usage: '.ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ',
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
        const { reply, react } = extra;
        const firstWord = args && args[0] ? args[0].toLowerCase() : "";

        // Cas 1 : Activation du mode NLP
        if (firstWord === 'on') {
            global.ghostgMode = 'on';
            await react('🧠');
            return reply(`🟢 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴀᴄᴛɪᴠᴇ́. ᴊᴇ ᴛ'ᴇ́ᴄᴏᴜᴛᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        
        // Cas 2 : Désactivation du mode NLP
        if (firstWord === 'off') {
            global.ghostgMode = 'off';
            await react('💤');
            return reply(`💡 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴍɪs ᴇɴ ᴠᴇɪʟʟᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        
        // Cas par défaut : Affichage du statut
        const modeStatus = global.ghostgMode === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
        return reply(`🤖 *ɢʜᴏsᴛɢ ᴄᴏɴᴛʀᴏʟ : ${modeStatus}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
};
