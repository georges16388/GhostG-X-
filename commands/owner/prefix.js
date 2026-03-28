/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Commande Info Préfixe
 * Spéciale Owner (Georges)
 */

// --- UTILITAIRE LOCAL (Évite l'erreur de module manquant) ---
const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
    name: "prefix",
    aliases: ["pref", "prfx"],
    description: "Affiche le préfixe actuel du bot",
    category: "owner",
    ownerOnly: true,

    async execute(sock, msg, args, { prefix, reply, react }) {
        try {
            await react('✨');
            
            // Design Prestige Elite
            const message = `*╭╼━≪• ɢʜᴏsᴛɢ-x ᴄᴏɴғɪɢ •≫━╾╮*\n` +
                            `*┃*\n` +
                            `*┃* ⚡ *${toSmallCaps("prefixe actuel")}* : [ *${prefix}* ]\n` +
                            `*┃* 👑 *${toSmallCaps("mode owner")}* : [ *>* ]\n` +
                            `*┃*\n` +
                            `*╰━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                            `> *${toSmallCaps("rappel : vous pouvez forcer les commandes avec >")}.*`;

            // Envoi avec Newsletter pour le style Prestige
            return await sock.sendMessage(msg.key.remoteJid, {
                text: message,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363425540434745@newsletter',
                        newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                        serverMessageId: 143
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error('Prefix Command Error:', err);
        }
    }
};
