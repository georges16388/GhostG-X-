/**
 * ViewOnce Reveal - GhostG-X MD
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * vv  : révèle dans le groupe
 * vv2 : révèle en privé + supprime la commande (mode fantôme)
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

const toStyledCaps = (text) => {
    if (!text) return '';
    const fonts = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
        'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
        'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
        'y':'ʏ','z':'ᴢ'
    };
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// ─────────────────────────────────────────────
// DESIGNS
// ─────────────────────────────────────────────

const AGM_DESIGN = (type, caption) => {
    const styledCaption = caption
        ? toStyledCaps(caption.length > 15 ? caption.substring(0, 12) + '...' : caption)
        : toStyledCaps('ɴᴏ ᴄᴀᴘᴛɪᴏɴ');

    return (
        `*╭╼━≪• ${toStyledCaps('ᴠɪᴇᴡ-ᴏɴᴄᴇ ʀᴇᴠᴇᴀʟ')} •≫━╾╮*\n` +
        `*┃* 📂 *${toStyledCaps('ᴛʏᴘᴇ')}*    : *${toStyledCaps(type)}*\n` +
        `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}*  : 🟢 *${toStyledCaps('ᴜɴʟᴏᴄᴋᴇᴅ')}*\n` +
        `*┃* 📝 *${toStyledCaps('ᴄᴀᴘᴛɪᴏɴ')}* : *${styledCaption}*\n` +
        `*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}*    : *${toStyledCaps('ᴘʀᴇsᴛɪɢᴇ')}*\n` +
        `*╰━━━━━━━━━━━━━━━╯*\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
    );
};

const AGM_GHOST = (type, caption) => {
    const styledCaption = caption
        ? toStyledCaps(caption.length > 15 ? caption.substring(0, 12) + '...' : caption)
        : toStyledCaps('ɴᴏ ᴄᴀᴘᴛɪᴏɴ');

    return (
        `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ᴍᴏᴅᴇ')} •≫━╾╮*\n` +
        `*┃* 👻 *${toStyledCaps('ᴍᴏᴅᴇ')}*    : *${toStyledCaps('ᴘʀɪᴠᴇ & sɪʟᴇɴᴄɪᴇᴜx')}*\n` +
        `*┃* 📂 *${toStyledCaps('ᴛʏᴘᴇ')}*    : *${toStyledCaps(type)}*\n` +
        `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}*  : 🟢 *${toStyledCaps('ᴜɴʟᴏᴄᴋᴇᴅ')}*\n` +
        `*┃* 📝 *${toStyledCaps('ᴄᴀᴘᴛɪᴏɴ')}* : *${styledCaption}*\n` +
          `*╰━━━━━━━━━━━━━━━╯*\n` +
        `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
    );
};

// ─────────────────────────────────────────────
// CORE : extraction + download du média
// ─────────────────────────────────────────────

const extractAndDownload = async (msg) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return null;

    const viewOnceType = quoted.viewOnceMessageV2
                      ?? quoted.viewOnceMessageV2Extension
                      ?? quoted.viewOnceMessage
                      ?? null;

    const actualMsg = viewOnceType ? viewOnceType.message : quoted;
    const mtype     = Object.keys(actualMsg)[0];
    const media     = actualMsg[mtype];

    if (!media?.viewOnce && !viewOnceType) return null;

    const downloadType = mtype.replace('Message', '');
    const stream       = await downloadContentFromMessage(media, downloadType);

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    return { buffer, mtype, caption: media.caption || '' };
};

// ─────────────────────────────────────────────
// ENVOI DU MÉDIA (réutilisé par vv et vv2)
// ─────────────────────────────────────────────

const sendMedia = async (sock, dest, buffer, mtype, design, quotedMsg = null) => {
    const opts = quotedMsg ? { quoted: quotedMsg } : {};

    if (/video/.test(mtype)) {
        await sock.sendMessage(dest, {
            video:    buffer,
            caption:  design,
            mimetype: 'video/mp4'
        }, opts);

    } else if (/image/.test(mtype)) {
        await sock.sendMessage(dest, {
            image:    buffer,
            caption:  design,
            mimetype: 'image/jpeg'
        }, opts);

    } else if (/audio/.test(mtype)) {
        await sock.sendMessage(dest, {
            audio:    buffer,
            ptt:      true,
            mimetype: 'audio/ogg; codecs=opus'
        }, opts);
        await sock.sendMessage(dest, { text: design }, opts);
    }
};

// ─────────────────────────────────────────────
// COMMANDE
// ─────────────────────────────────────────────

module.exports = {
    name:        'viewonce',
    aliases:     ['readvo', 'read', 'vv', 'vv2', 'readviewonce'],
    category:    'general',
    description: 'Révèle les messages à vue unique. vv2 = mode privé fantôme.',
    usage:       '.vv (groupe) | .vv2 (privé + discret)',

    async execute(sock, msg, args, extra) {
        const { from, react } = extra;
        const command = extra.commandName ?? extra.command ?? '';
        const isGhostMode = command === 'vv2';

        // Récupérer le JID de l'expéditeur (pour l'envoi privé)
        const senderJid = msg.key?.participant ?? msg.key?.remoteJid;

        try {
            // ── 1. EXTRACTION ──
            const result = await extractAndDownload(msg);

            if (!result) {
                return sock.sendMessage(from, {
                    text: `⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ ᴍᴇssᴀɢᴇ ᴠɪᴇᴡ-ᴏɴᴄᴇ')}*`
                }, { quoted: msg });
            }

            const { buffer, mtype, caption } = result;
            const displayType = /video/.test(mtype) ? 'ᴠɪᴅᴇᴏ'
                              : /image/.test(mtype) ? 'ɪᴍᴀɢᴇ'
                              : 'ᴀᴜᴅɪᴏ';

            await react('🔓');

            if (isGhostMode) {
                // ── MODE VV2 : FANTÔME ──

                // 1. Supprimer la commande immédiatement
                await sock.sendMessage(from, { delete: msg.key });

                // 2. Envoyer en privé à l'expéditeur
                const design = AGM_GHOST(displayType, caption);
                await sendMedia(sock, senderJid, buffer, mtype, design);

            } else {
                // ── MODE VV : NORMAL dans le groupe ──
                const design = AGM_DESIGN(displayType, caption);
                await sendMedia(sock, from, buffer, mtype, design, msg);
                await react('✅');
            }

        } catch (error) {
            console.error('[VIEWONCE ERROR]:', error);
            await sock.sendMessage(from, {
                text: `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ʀᴇᴠᴇʟᴀᴛɪᴏɴ')}*`
            }, { quoted: msg });
        }
    }
};