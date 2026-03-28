/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Commande Info Préfixe
 * Spéciale Owner (Georges)
 */

const { toSmallCaps } = require('../../utils/format'); 

module.exports = {
    name: "prefix",
    description: "Affiche le préfixe actuel du bot",
    category: "owner",
    ownerOnly: true,

    async execute(sock, msg, args, { prefix, reply, react }) {
        try {
            await react('✨');
            // Utilisation du design Prestige avec Small Caps
            const message = `✨ *${toSmallCaps("mon préfixe actuel est")}* : [ *${prefix}* ]\n\n> *${toSmallCaps("rappel : vous pouvez aussi utiliser > en tant qu'owner.")}*`;
            
            return reply(message);
        } catch (err) {
            console.error('Prefix Command Error:', err);
        }
    }
};
