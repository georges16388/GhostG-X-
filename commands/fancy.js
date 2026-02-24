import send from "../utils/sendMessage.js";

// Maps de polices
const cursiveMap = { /*... ton cursiveMap ...*/ };
const boldMap = { /*... ton boldMap ...*/ };
const italicMap = { /*... ton italicMap ...*/ };
const boldItalicMap = { /*... ton boldItalicMap ...*/ };
const squaredMap = { /*... ton squaredMap ...*/ };

// Fonts classiques et décoratives
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

export default async function fancyCommand(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const parts = text.trim().split(/\s+/);
        const args = parts.slice(1).filter(p => p.trim() !== '');

        // Pas d'argument : afficher preview
        if (args.length === 0 || isNaN(parseInt(args[0]))) {
            const sampleText = "Fancy Text";
            const preview = fancyFonts.map((f, i) => `*${i + 1}.* ${f(sampleText)}`).join('\n\n');
            return await send(sock, jid, { text: preview });
        }

        const styleIndex = parseInt(args[0]) - 1;
        const content = args.slice(1).join(' ');

        if (styleIndex < 0 || styleIndex >= fancyFonts.length) {
            return await send(sock, jid, {
                text: `❌ Numéro de style invalide. Utilise *.fancy* pour voir les styles.`
            });
        }

        if (!content.trim()) {
            return await send(sock, jid, {
                text: `⚠️ Fournis le texte à styliser.\nExemple: *.fancy 3 Hello World!*`
            });
        }

        const styled = fancyFonts[styleIndex](content);
        await send(sock, jid, { text: styled });

    } catch (err) {
        console.error("❌ Erreur fancyCommand:", err);
        await send(sock, message.key.remoteJid, {
            text: `❌ Impossible de styliser le texte : ${err.message}`
        });
    }
}