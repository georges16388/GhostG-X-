/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Fix : extraction videoId robuste + fallback APIs + durée + vues
 */

const yts  = require('yt-search');
const APIs = require('../../utils/api');

// ─────────────────────────────────────────────
// HELPERS
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

const formatViews = (n) => {
    if (!n) return 'ɴ/ᴀ';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'ᴍ';
    if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'ᴋ';
    return String(n);
};

const truncate = (text, max = 28) =>
    text && text.length > max ? text.substring(0, max - 3) + '...' : (text || '');

// ─────────────────────────────────────────────
// DESIGNS
// ─────────────────────────────────────────────

/** Design d'aperçu — pendant la recherche */
const AGM_PREVIEW = (title, duration, views, author) =>
    `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ sʏsᴛᴇᴍ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🎬 *${toStyledCaps('ᴛɪᴛʟᴇ')}*  : *${toStyledCaps(truncate(title))}*\n` +
    `*┃* 👤 *${toStyledCaps('ᴄʜᴀɴɴᴇʟ')}* : *${toStyledCaps(truncate(author, 22))}*\n` +
    `*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${toStyledCaps(duration || 'ɴ/ᴀ')}*\n` +
    `*┃* 👁️ *${toStyledCaps('ᴠɪᴇᴡs')}*   : *${toStyledCaps(formatViews(views))}*\n` +
    `*┃* ⏳ *${toStyledCaps('sᴛᴀᴛᴜs')}*  : 🟡 *${toStyledCaps('ᴘʀᴏᴄᴇssɪɴɢ...')}*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

/** Design final — avec lien */
const AGM_FINAL = (title, duration, views, author, url) =>
    `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ sʏsᴛᴇᴍ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🎬 *${toStyledCaps('ᴛɪᴛʟᴇ')}*  : *${toStyledCaps(truncate(title))}*\n` +
    `*┃* 👤 *${toStyledCaps('ᴄʜᴀɴɴᴇʟ')}* : *${toStyledCaps(truncate(author, 22))}*\n` +
    `*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${toStyledCaps(duration || 'ɴ/ᴀ')}*\n` +
    `*┃* 👁️ *${toStyledCaps('ᴠɪᴇᴡs')}*   : *${toStyledCaps(formatViews(views))}*\n` +
    `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}*  : 🟢 *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}*\n` +
    `*┃* 🔗 *${toStyledCaps('ʟɪɴᴋ')}*   : ${url}\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

// ─────────────────────────────────────────────
// EXTRACTION ID YOUTUBE
// ─────────────────────────────────────────────

const YT_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

const extractVideoId = (url) =>
    url.match(
        /(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/
    )?.[1] ?? null;

// ─────────────────────────────────────────────
// RÉSOLUTION VIDÉO (Multi-API avec fallback)
// ─────────────────────────────────────────────

/**
 * Tente chaque API dans l'ordre et retourne la première URL valide.
 * Chaque resolver doit retourner { url } ou { download }.
 */
const resolveVideoUrl = async (youtubeUrl) => {
    const methods = [
        APIs.getEliteProTechVideoByUrl,
        APIs.getYupraVideoByUrl,
        APIs.getOkatsuVideoByUrl
    ].filter(Boolean); // ignore les APIs non définies

    for (const method of methods) {
        try {
            const res = await method(youtubeUrl);
            const url = res?.download ?? res?.url ?? res?.link ?? null;
            if (url && url.startsWith('http')) return url;
        } catch (_) { /* tentative suivante */ }
    }
    return null;
};

// ─────────────────────────────────────────────
// COMMANDE PRINCIPALE
// ─────────────────────────────────────────────

module.exports = {
    name:        'ytvideo',
    aliases:     ['ytv', 'ytmp4', 'ytvid', 'video', 'shorts'],
    category:    'media',
    description: 'Télécharger des vidéos YouTube en HD',
    usage:       '.video <nom ou lien YouTube>',

    async execute(sock, msg, args, extra) {
        const chatId = extra.from;
        const text   = args.join(' ').trim();

        try {
            // ── 0. VALIDATION ──
            if (!text) {
                return extra.reply(
                    `⚠️ *${toStyledCaps('ᴇɴᴛʀᴇᴢ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ')}*\n\n` +
                    `📎 _Exemple :_ \`.video never gonna give you up\``
                );
            }

            await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

            // ── 1. RECHERCHE YOUTUBE ──
            let video;

            if (YT_URL_REGEX.test(text)) {
                // URL directe
                const videoId = extractVideoId(text);
                // yts accepte un videoId ou une URL complète
                const res = await yts({ videoId: videoId ?? text });
                // yts({ videoId }) retourne directement l'objet vidéo
                video = res?.videos?.[0] ?? res;
            } else {
                // Recherche par mot-clé
                const search = await yts(text);
                if (!search.videos?.length) {
                    return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴᴇ ᴠɪᴅᴇᴏ ᴛʀᴏᴜᴠᴇᴇ')}*`);
                }
                video = search.videos[0];
            }

            if (!video?.url) throw new Error('VIDEO_METADATA_MISSING');

            const { title, url, thumbnail, image, duration, views, author } = video;
            const thumb      = thumbnail ?? image ?? '';
            const authorName = typeof author === 'object' ? author?.name : author;
            const durationStr = duration?.timestamp ?? duration ?? '';

            // ── 2. APERÇU THUMBNAIL ──
            await sock.sendMessage(chatId, {
                image:   { url: thumb },
                caption: AGM_PREVIEW(title, durationStr, views, authorName),
                contextInfo: {
                    externalAdReply: {
                        title:                 toStyledCaps('ɢʜᴏsᴛ ᴠɪᴅᴇᴏ sʏsᴛᴇᴍ'),
                        body:                  toStyledCaps('ᴀɴᴀʟʏsᴇ ᴅᴜ ғʟᴜx ʜᴅ...'),
                        mediaType:             1,
                        thumbnailUrl:          thumb,
                        renderLargerThumbnail: true,
                        showAdAttribution:     false
                    }
                }
            }, { quoted: msg });

            // ── 3. RÉSOLUTION DU LIEN DE TÉLÉCHARGEMENT ──
            const finalUrl = await resolveVideoUrl(url);
            if (!finalUrl) throw new Error('ALL_APIS_FAILED');

            

            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error('❌ [YTVIDEO ERROR]:', error.message);

            const msg_err = error.message === 'ALL_APIS_FAILED'
                ? 'ᴛᴏᴜᴛᴇs ʟᴇs sᴏᴜʀᴄᴇs ᴏɴᴛ ᴇᴄʜᴏᴜᴇ. ʀᴇᴇssᴀɪᴇ.'
                : 'ᴇʀʀᴇᴜʀ ɪɴᴛᴇʀɴᴇ. ᴠᴇʀɪғɪᴇ ʟᴇ ʟɪᴇɴ ᴇᴛ ʀᴇᴇssᴀɪᴇ.';

            await extra.reply(
                `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ')}*\n\n` +
                `> ${toStyledCaps(msg_err)}`
            );
            await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
        }
    }
};