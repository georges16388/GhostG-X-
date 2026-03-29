/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Source : ytdl-core → btch-downloader → APIs fallback
 */

const yts  = require('yt-search');
const ytdl = require('ytdl-core');
const { ytmp3 } = require('btch-downloader');
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

const AGM_PREVIEW = (title, duration, views, author) =>
    `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🎵 *${toStyledCaps('sᴏɴɢ')}*     : *${toStyledCaps(truncate(title))}*\n` +
    `*┃* 👤 *${toStyledCaps('ᴀʀᴛɪsᴛ')}*   : *${toStyledCaps(truncate(author, 22))}*\n` +
    `*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${toStyledCaps(duration || 'ɴ/ᴀ')}*\n` +
    `*┃* 👁️ *${toStyledCaps('ᴠɪᴇᴡs')}*    : *${toStyledCaps(formatViews(views))}*\n` +
    `*┃* ⏳ *${toStyledCaps('sᴛᴀᴛᴜs')}*   : 🟡 *${toStyledCaps('ᴘʀᴏᴄᴇssɪɴɢ...')}*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

const AGM_FINAL = (title, duration, views, author) =>
    `\n` +
    `*━━━━━━━━━━━━━━━━━━━━━━*\n` +
    `  🎵 *${toStyledCaps('ɢʜᴏsᴛɢ')}* 𝐗 *${toStyledCaps('ᴍᴜsɪᴄ sʏsᴛᴇᴍ')}* 🎵\n` +
    `*━━━━━━━━━━━━━━━━━━━━━━*\n` +
    `\n` +
    `  🎶  *${toStyledCaps(truncate(title, 30))}*\n` +
    `\n` +
    `  👤  ${toStyledCaps(truncate(author, 24))}\n` +
    `  ⏱️  ${toStyledCaps(duration || 'ɴ/ᴀ')}   •   👁️  ${toStyledCaps(formatViews(views))}\n` +
    `\n` +
    `  ✅  *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇ')}*  •  🎧 *ʜɪɢʜ ǫᴜᴀʟɪᴛʏ*\n` +
    `\n` +
    `*━━━━━━━━━━━━━━━━━━━━━━*\n` +
    `> *-ّ⸙𓆩 ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ*`;

// ─────────────────────────────────────────────
// EXTRACTION ID YOUTUBE
// ─────────────────────────────────────────────

const YT_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

const extractVideoId = (url) =>
    url.match(
        /(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/
    )?.[1] ?? null;

// ─────────────────────────────────────────────
// DOWNLOAD AUDIO BUFFER (ytdl-core)
// ─────────────────────────────────────────────

const downloadAudioBuffer = (url) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        const stream = ytdl(url, {
            quality: 'highestaudio',
            filter:  'audioonly',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            }
        });
        stream.on('data',  chunk => chunks.push(chunk));
        stream.on('end',   ()    => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });

// ─────────────────────────────────────────────
// RÉSOLUTION AUDIO (3 sources + fallback APIs)
// ─────────────────────────────────────────────


    const resolveAudio = async (videoUrl) => {
    // ── Source 1 : ytdl-core (buffer) ──
    try {
        console.log('[SONG] Tentative ytdl-core...');
        const buffer = await downloadAudioBuffer(videoUrl);
        if (buffer?.length > 0) {
            console.log('[SONG] ytdl-core ✅', buffer.length, 'bytes');
            return { type: 'buffer', data: buffer };
        }
    } catch (e) {
        console.warn('[SONG] ytdl-core échoué:', e.message);
    }

    // ── Source 2 : btch-downloader (URL) ──
    try {
        console.log('[SONG] Tentative btch-downloader...');
        const res = await ytmp3(videoUrl);
        const url = res?.dl ?? res?.url ?? res?.download ?? null;
        if (url?.startsWith('http')) {
            console.log('[SONG] btch-downloader ✅');
            return { type: 'url', data: url };
        }
    } catch (e) {
        console.warn('[SONG] btch-downloader échoué:', e.message);
    }

    // ── Source 3 : APIs fallback (noms corrects) ──
    const methods = [
        APIs.getIzumiDownloadByUrl,
        APIs.getYupraDownloadByUrl
    ].filter(Boolean);

    for (const method of methods) {
        try {
            console.log('[SONG] Tentative API fallback...');
            const res = await method(videoUrl);
            const audioUrl = res?.download ?? res?.url ?? null;
            if (audioUrl?.startsWith('http')) {
                console.log('[SONG] API fallback ✅');
                return { type: 'url', data: audioUrl };
            }
        } catch (_) { /* tentative suivante */ }
    }

    return null;
};

    // ── Source 2 : btch-downloader (URL) ──
    try {
        console.log('[SONG] Tentative btch-downloader...');
        const res = await ytmp3(videoUrl);
        const url = res?.dl ?? res?.url ?? res?.download ?? null;
        if (url?.startsWith('http')) {
            console.log('[SONG] btch-downloader ✅');
            return { type: 'url', data: url };
        }
    } catch (e) {
        console.warn('[SONG] btch-downloader échoué:', e.message);
    }

    // ── Source 3 : APIs fallback ──
    const methods = [
        APIs.getEliteProTechAudioByUrl,
        APIs.getYupraAudioByUrl,
        APIs.getOkatsuAudioByUrl
    ].filter(Boolean);

    for (const method of methods) {
        try {
            console.log('[SONG] Tentative API fallback...');
            const res = await method(videoUrl);
            const url = res?.download ?? res?.url ?? res?.link ?? null;
            if (url?.startsWith('http')) {
                console.log('[SONG] API fallback ✅');
                return { type: 'url', data: url };
            }
        } catch (_) { /* tentative suivante */ }
    }

    return null;
};

// ─────────────────────────────────────────────
// COMMANDE PRINCIPALE
// ─────────────────────────────────────────────

module.exports = {
    name:        'song',
    aliases:     ['play', 'music', 'yta', 'audio', 'ytmp3'],
    category:    'media',
    description: 'Télécharger de la musique depuis YouTube',
    usage:       '.song <nom ou lien YouTube>',

    async execute(sock, msg, args, extra) {
        const chatId = extra.from;
        const text   = args.join(' ').trim();

        try {
            // ── 0. VALIDATION ──
            if (!text) {
                return extra.reply(
                    `⚠️ *${toStyledCaps('ᴇɴᴛʀᴇᴢ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ')}*\n\n` +
                    `📎 _Exemple :_ \`.song blinding lights\``
                );
            }

            await sock.sendMessage(chatId, { react: { text: '🎧', key: msg.key } });

            // ── 1. RECHERCHE YOUTUBE ──
            let video;

            if (YT_URL_REGEX.test(text)) {
                const videoId = extractVideoId(text);
                const res     = await yts({ videoId: videoId ?? text });
                video         = res?.videos?.[0] ?? res;
                // Si yts retourne un objet sans title → fallback recherche
                if (!video?.title) {
                    const fallback = await yts(text);
                    video = fallback.videos?.[0];
                }
            } else {
                const search = await yts(text);
                if (!search.videos?.length) {
                    return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
                }
                video = search.videos[0];
            }

            if (!video?.url) throw new Error('VIDEO_METADATA_MISSING');

            const { title, url, thumbnail, image, duration, views, author } = video;
            const thumb       = thumbnail ?? image ?? '';
            const authorName  = typeof author === 'object' ? author?.name : (author || '');
            const durationStr = duration?.timestamp ?? duration ?? '';

            // ── 2. APERÇU THUMBNAIL ──
            await sock.sendMessage(chatId, {
                image:   { url: thumb },
                caption: AGM_PREVIEW(title, durationStr, views, authorName),
                contextInfo: {
                    externalAdReply: {
                        title:                 toStyledCaps('ɢʜᴏsᴛ ᴍᴜsɪᴄ sʏsᴛᴇᴍ'),
                        body:                  toStyledCaps('ᴀɴᴀʟʏsᴇ ᴅᴜ ᴛʀᴀᴄᴋ...'),
                        mediaType:             1,
                        thumbnailUrl:          thumb,
                        renderLargerThumbnail: true,
                        showAdAttribution:     false
                    }
                }
            }, { quoted: msg });

            // ── 3. RÉSOLUTION AUDIO ──
            const resolved = await resolveAudio(url);
            if (!resolved) throw new Error('ALL_SOURCES_FAILED');

            // ── 4. ENVOI AUDIO + DESIGN FINAL ──
            // FIX : caption non supporté sur audioMessage dans Baileys
            // → on envoie le design en texte AVANT l'audio
            await sock.sendMessage(chatId, {
                text: AGM_FINAL(title, durationStr, views, authorName)
            }, { quoted: msg });

            await sock.sendMessage(chatId, {
                audio:    resolved.type === 'buffer'
                            ? resolved.data
                            : { url: resolved.data },
                mimetype: 'audio/mpeg',
                fileName: `${truncate(title, 60)}.mp3`,
                ptt:      false
            }, { quoted: msg });

            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error('❌ [SONG ERROR]:', error.message);

            const msg_err = error.message === 'ALL_SOURCES_FAILED'
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