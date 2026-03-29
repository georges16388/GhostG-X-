/**
 * TTS - GhostG-X MD Vocal Edition
 * Style & Design by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Engine : Google TTS → fallback API
 */

const axios = require('axios');

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
// RÉSOLUTION TTS (3 sources)
// ─────────────────────────────────────────────

const resolveTTS = async (text) => {

    // ── Source 1 : Google TTS ──
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
            }
        });
        const buf = Buffer.from(res.data);
        if (buf.length > 1000) {
            console.log('[TTS] Google ✅', buf.length, 'bytes');
            return buf;
        }
    } catch (e) {
        console.warn('[TTS] Google échoué:', e.message);
    }

    // ── Source 2 : ttsmp3.com ──
    try {
        const res = await axios.post('https://ttsmp3.com/makemp3_new.php',
            `msg=${encodeURIComponent(text)}&lang=Celine&source=ttsmp3`,
            {
                timeout: 10000,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        const mp3Url = res.data?.URL;
        if (mp3Url) {
            const audio = await axios.get(mp3Url, { responseType: 'arraybuffer', timeout: 10000 });
            const buf = Buffer.from(audio.data);
            if (buf.length > 1000) {
                console.log('[TTS] ttsmp3 ✅');
                return buf;
            }
        }
    } catch (e) {
        console.warn('[TTS] ttsmp3 échoué:', e.message);
    }

    // ── Source 3 : voicerss ──
    try {
        const res = await axios.get(
            `https://api.voicerss.org/?key=&hl=fr-fr&src=${encodeURIComponent(text)}&c=MP3&f=44khz_16bit_mono`,
            { responseType: 'arraybuffer', timeout: 10000 }
        );
        const buf = Buffer.from(res.data);
        if (buf.length > 1000) {
            console.log('[TTS] VoiceRSS ✅');
            return buf;
        }
    } catch (e) {
        console.warn('[TTS] VoiceRSS échoué:', e.message);
    }

    return null;
};

// ─────────────────────────────────────────────
// COMMANDE
// ─────────────────────────────────────────────

module.exports = {
    name:        'tts',
    aliases:     ['speak', 'say', 'vocal'],
    category:    'essentials',
    description: 'Convertir un texte en message vocal (Français).',
    usage:       '.tts <texte>',

    async execute(sock, msg, args, extra) {
        const chatId = extra.from;
        const text   = args.join(' ').trim();

        try {
            if (!text) {
                return extra.reply(
                    `⚠️ *${toStyledCaps('ᴇɴᴛʀᴇᴢ ᴜɴ ᴛᴇxᴛᴇ ᴀ ᴠᴏᴄᴀʟɪsᴇʀ')}*\n\n` +
                    `📎 _Exemple :_ \`.tts bonjour tout le monde\``
                );
            }

            await sock.sendMessage(chatId, { react: { text: '🎙️', key: msg.key } });

            // ── Résolution audio ──
            const audioBuffer = await resolveTTS(text);
            if (!audioBuffer) throw new Error('ALL_TTS_FAILED');

            // ── Envoi PTT uniquement (pas de texte, pas de caption) ──
            await sock.sendMessage(chatId, {
                audio:    audioBuffer,
                mimetype: 'audio/ogg; codecs=opus',  // ✅ mimetype correct pour PTT
                ptt:      true
            }, { quoted: msg });

            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error('[TTS ERROR]:', error.message);
            await extra.reply(
                `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ɢᴇɴᴇʀᴀᴛɪᴏɴ ᴠᴏᴄᴀʟᴇ')}*\n\n` +
                `> ${toStyledCaps('ᴛᴏᴜᴛᴇs ʟᴇs sᴏᴜʀᴄᴇs sᴏɴᴛ ɪɴᴅɪsᴘᴏɴɪʙʟᴇs. ʀᴇᴇssᴀɪᴇ.')}`
            );
            await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
        }
    }
};