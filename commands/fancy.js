import send from "../utils/sendMessage.js";

// ====================
// 🔥 MAPS
// ====================

const cursiveMap = { /* garde ton map */ };
const boldMap = { /* garde ton map */ };
const italicMap = { /* garde ton map */ };
const boldItalicMap = { /* garde ton map */ };
const squaredMap = { /* garde ton map */ };

// ====================
// 🔥 FONTS
// ====================

const classicFonts = [
    (t) => t, 
    (t) => t.toUpperCase(),
    (t) => t.toLowerCase(),
    (t) => [...t].map(c => cursiveMap[c] || c).join(''),
    (t) => [...t].map(c => boldMap[c] || c).join(''),
    (t) => [...t].map(c => italicMap[c] || c).join(''),
    (t) => [...t].map(c => boldItalicMap[c] || c).join(''),
    (t) => `\`\`\`${t}\`\`\``,
    (t) => [...t].map(c => 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'['abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase())] || c).join(''),
    (t) => [...t].map(c => squaredMap[c.toUpperCase()] || c).join(''),
    (t) => [...t].map(c => `(${c})`).join(''),
    (t) => [...t].map(c => c + 'ͤ').join(''),
    (t) => t.split('').join(' '),
    (t) => t.split('').map(c => c + '͜͡').join(''),
    (t) => `༎${t}༎`,
    (t) => `「${t}」`,
    (t) => `『★${t}★』`,
    (t) => `⟦${t}⟧`,
    (t) => `*${t}*`,
];

const decorativeFonts = [
    (t) => `✨ ${t} ✨`,
    (t) => `🔥 ${t.toUpperCase()} 🔥`,
    (t) => [...t].map(c => `💀${c}`).join(''),
    (t) => `༒ ${t} ༒`,
    (t) => `༼ ${t} ༽`,
    (t) => `★彡 ${t} 彡★`,
    (t) => `၌${t.toUpperCase()}၌`,
    (t) => `🎀 ${t} 🎀`,
    (t) => `👑${t}👑`,
    (t) => `✧･ﾟ: *✧･ﾟ:* ${t} *:･ﾟ✧*:･ﾟ✧`,
];

const fancyFonts = [...classicFonts, ...decorativeFonts];

// ====================
// 💀 STYLE GHOST
// ====================

export function ghost(text = "") {
    const map = {
        a:"ᴀ", b:"ʙ", c:"ᴄ", d:"ᴅ", e:"ᴇ", f:"ғ",
        g:"ɢ", h:"ʜ", i:"ɪ", j:"ᴊ", k:"ᴋ", l:"ʟ",
        m:"ᴍ", n:"ɴ", o:"ᴏ", p:"ᴘ", q:"ǫ", r:"ʀ",
        s:"s", t:"ᴛ", u:"ᴜ", v:"ᴠ", w:"ᴡ", x:"x",
        y:"ʏ", z:"ᴢ"
    };

    return text
        .split("")
        .map(l => map[l.toLowerCase()] || l)
        .join("");
}

// ====================
// 🔥 UTILISER FANCY
// ====================

export function applyFancy(index, text) {
    if (index < 0 || index >= fancyFonts.length) return text;
    return fancyFonts[index](text);
}

// ====================
// 💀 COMMANDE FANCY
// ====================

export default async function fancyCommand(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const parts = text.trim().split(/\s+/);
        const args = parts.slice(1).filter(p => p.trim() !== '');

        // 👁️ Preview
        if (args.length === 0 || isNaN(parseInt(args[0]))) {
            const sampleText = ghost("ghostg-x");
            const preview = fancyFonts
                .map((f, i) => `*${i + 1}.* ${f(sampleText)}`)
                .join('\n\n');

            return await send(sock, jid, { text: preview });
        }

        const styleIndex = parseInt(args[0]) - 1;
        const content = args.slice(1).join(' ');

        if (styleIndex < 0 || styleIndex >= fancyFonts.length) {
            return await send(sock, jid, {
                text: `❌ Style invalide, maître.`
            });
        }

        if (!content.trim()) {
            return await send(sock, jid, {
                text: `⚠️ Maître, donnez-moi un texte à transformer.\nEx: *.fancy 3 Hello*`
            });
        }

        const styled = fancyFonts[styleIndex](content);

        await send(sock, jid, {
            text: `💀 ${ghost("transformation effectuée")}\n\n${styled}`
        });

    } catch (err) {
        console.error("❌ Erreur fancyCommand:", err);

        await send(sock, message.key.remoteJid, {
            text: `❌ ${ghost("échec de la transformation")} : ${err.message}`
        });
    }
}