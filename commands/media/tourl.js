/**
 * Media To URL - AGM Cloud Edition (Catbox + Uguu Fallback)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Fix : finalCaption envoyé + détection média robuste + audio support
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadByBuffer } = require('../../utils/uploader');

// ─────────────────────────────────────────────
// HELPERS DESIGN
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

const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' ᴍʙ';
    if (bytes >= 1024)    return (bytes / 1024).toFixed(1)    + ' ᴋʙ';
    return bytes + ' ʙ';
};

// Icône selon le type de média
const getTypeIcon = (type) => {
    const icons = {
        image:    '🖼️',
        video:    '🎬',
        audio:    '🎵',
        sticker:  '🎭',
        document: '📄'
    };
    return icons[type] ?? '📁';
};

const AGM_DESIGN = (size, type, url) =>
    `*╭╼━≪• ${toStyledCaps('ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴜᴘʟᴏᴀᴅᴇᴅ')}*\n` +
    `*┃* ${getTypeIcon(type)} *${toStyledCaps('ᴛʏᴘᴇ')}*  : *${toStyledCaps(type)}*\n` +
    `*┃* ⚖️ *${toStyledCaps('sɪᴢᴇ')}*  : *${size}*\n` +
    `*┃* 🔗 *${toStyledCaps('ʟɪɴᴋ')}*  : ${url}\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

// ─────────────────────────────────────────────
// MAP : clé Baileys → type de download
// ─────────────────────────────────────────────

const MEDIA_TYPE_MAP = {
    imageMessage:    'image',
    videoMessage:    'video',
    audioMessage:    'audio',
    stickerMessage:  'sticker',
    documentMessage: 'document',
    // Vignettes dans viewOnceMessage, etc.
    viewOnceMessageV2: null  // on drill plus bas si besoin
};

/**
 * Récupère { messageContent, downloadType, labelType } depuis un objet message,
 * qu'il soit direct ou imbriqué (viewOnce, ephemeral…)
 */
function detectMedia(msgObj) {
    for (const [key, dlType] of Object.entries(MEDIA_TYPE_MAP)) {
        if (msgObj[key]) {
            return {
                messageContent: msgObj[key],
                downloadType:   dlType,
                labelType:      key.replace('Message', '')
            };
        }
    }
    return null;
}

// ─────────────────────────────────────────────
// COMMANDE PRINCIPALE
// ─────────────────────────────────────────────

module.exports = {
    name:        'tourl',
    aliases:     ['url', 'makeurl', 'catbox', 'host'],
    category:    'media',
    description: 'Convertir un média en lien URL via Catbox / Uguu',
    usage:       '.tourl (répondez à un média)',

    async execute(sock, msg, args, extra) {
        const from = extra.from;

        try {
            // ── 1. DÉTECTION DU MÉDIA (message cité OU message direct) ──
            const quotedMsg =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ??
                msg.message?.imageMessage      && msg.message ??
                msg.message?.videoMessage      && msg.message ??
                msg.message?.audioMessage      && msg.message ??
                msg.message?.stickerMessage    && msg.message ??
                msg.message?.documentMessage   && msg.message ??
                null;

            const detected = quotedMsg ? detectMedia(quotedMsg) : null;

            if (!detected) {
                return extra.reply(
                    `⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*\n\n` +
                    `📎 _Supporte :_ image • vidéo • audio • sticker • document`
                );
            }

            const { messageContent, downloadType, labelType } = detected;

            // ── 2. RÉACTION D'ATTENTE ──
            await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });

            // ── 3. TÉLÉCHARGEMENT DU BUFFER ──
            const stream = await downloadContentFromMessage(messageContent, downloadType);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            if (!buffer || buffer.length === 0) {
                throw new Error('Buffer vide — média inaccessible');
            }

            // ── 4. UPLOAD ──
            const sizeStr  = formatSize(buffer.length);
            const mediaUrl = await uploadByBuffer(buffer);

            // ── 5. RÉPONSE FINALE (le bug corrigé ✅) ──
            await sock.sendMessage(from, {
                text: AGM_DESIGN(sizeStr, labelType, mediaUrl)
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error('❌ [ᴛᴏᴜʀʟ ᴇʀʀᴏʀ]:', error.message);

            const isUploadFail = error.message.includes('TOUTES_SOURCES');
            await extra.reply(
                `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ')}*\n\n` +
                `> ${toStyledCaps(isUploadFail
                    ? 'ᴛᴏᴜs ʟᴇs sᴇʀᴠᴇᴜʀs sᴏɴᴛ ɪɴᴅɪsᴘᴏɴɪʙʟᴇs. ʀᴇᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.'
                    : 'ᴇʀʀᴇᴜʀ ɪɴᴛᴇʀɴᴇ. ᴠᴇʀɪғɪᴇ ʟᴇ ᴍᴇᴅɪᴀ ᴇᴛ ʀᴇᴇssᴀɪᴇ.')}`
            );
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
        }
    }
};