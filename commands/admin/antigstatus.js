/**
 * ANTI-GROUP STATUS COMMAND - AGM SYSTEM CORE
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Modes : delete | warn <n> | kick
 */

const database = require('../../database');

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

const AGM_STATUS = (enabled, mode, maxWarns) => {
    const modeLine = mode === 'warn'
        ? `*${toStyledCaps('ᴡᴀʀɴ')}* ⚠️  (ʟɪᴍɪᴛ : *${maxWarns}*)`
        : mode === 'kick'
        ? `*${toStyledCaps('ᴋɪᴄᴋ')}* 🚫`
        : `*${toStyledCaps('ᴅᴇʟᴇᴛᴇ')}* 🗑️`;

    return (
        `*╭╼━≪• ${toStyledCaps('ᴀɴᴛɪ-ɢsᴛᴀᴛᴜs')} •≫━╾╮*\n` +
        `*┃*\n` +
        `*┃* 🛡️ *${toStyledCaps('sᴛᴀᴛᴜs')}* : ${enabled ? '🟢' : '🔴'} *${toStyledCaps(enabled ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅɪsᴀʙʟᴇᴅ')}*\n` +
        `*┃* ⚙️ *${toStyledCaps('ᴍᴏᴅᴇ')}*   : ${modeLine}\n` +
        `*┃* 🌐 *${toStyledCaps('sᴄᴏᴘᴇ')}*  : *${toStyledCaps('ɢʀᴏᴜᴘ ᴏɴʟʏ')}*\n` +
        `*┃*\n` +
        `*╰━━━━━━━━━━━━━━━╯*\n` +
        `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
    );
};

const AGM_WARN = (senderShort, current, max) =>
    `*╭╼━≪• ${toStyledCaps('ᴀɴᴛɪ-ɢsᴛᴀᴛᴜs ᴀʟᴇʀᴛ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🚨 *${toStyledCaps('ᴠɪᴏʟᴀᴛɪᴏɴ')}* : *${toStyledCaps('ɢʀᴏᴜᴘ sᴛᴀᴛᴜs ᴅᴇᴛᴇᴄᴛᴇᴅ')}*\n` +
    `*┃* 👤 *${toStyledCaps('ᴜsᴇʀ')}*      : @${senderShort}\n` +
    `*┃* ⚠️ *${toStyledCaps('ᴡᴀʀɴɪɴɢ')}*   : *${current}/${max}*\n` +
    `*┃* 🗑️ *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}*    : *${toStyledCaps('ᴍᴇssᴀɢᴇ sᴜᴘᴘʀɪᴍᴇ')}*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

// ─────────────────────────────────────────────
// DÉTECTION GROUP STATUS
// ─────────────────────────────────────────────

const isGroupStatus = (msg) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo
             ?? msg.message?.imageMessage?.contextInfo
             ?? msg.message?.videoMessage?.contextInfo
             ?? msg.message?.documentMessage?.contextInfo
             ?? null;
    if (!ctx) return false;
    const isForwarded   = ctx.isForwarded === true || (ctx.forwardingScore ?? 0) > 0;
    const fromBroadcast = ctx.remoteJid?.includes('broadcast') ||
                          ctx.remoteJid?.includes('status');
    return isForwarded && fromBroadcast;
};

// ─────────────────────────────────────────────
// COMMANDE
// ─────────────────────────────────────────────

module.exports = {
    name:        'antigstatus',
    aliases:     ['ags', 'antigs', 'antigroupstatus'],
    category:    'admin',
    description: 'Supprime les group statuses avec 3 modes : delete, warn, kick.',
    usage: [
        '.antigstatus on/off',
        '.antigstatus set delete',
        '.antigstatus set kick',
        '.antigstatus set warn <nombre>'
    ].join('\n'),
    groupOnly:  true,
    adminOnly:  true,

    // ── Handler appelé sur chaque message du groupe ──
    checkAndHandle: async (sock, msg, { from, sender, isBotAdmin }) => {
        const groupSettings = database.getGroupSettings(from) || {};
        if (!groupSettings.antigstatus) return;
        if (!isGroupStatus(msg))         return;
        if (!isBotAdmin)                 return;

        const mode        = groupSettings.antigstatusMode     ?? 'delete';
        const maxWarns    = groupSettings.antigstatusMaxWarns ?? 3;
        const senderShort = sender.split('@')[0];

        // ── Toujours supprimer le message ──
        await sock.sendMessage(from, { delete: msg.key });

        // ── MODE DELETE : suppression silencieuse ──
        if (mode === 'delete') return;

        // ── MODE KICK : expulsion silencieuse ──
        if (mode === 'kick') {
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            return;
        }

        // ── MODE WARN : avertissement + kick si limite atteinte ──
        if (mode === 'warn') {
            const warnsData   = database.getUserData(sender, `ags_warns_${from}`) || { count: 0 };
            const newCount    = warnsData.count + 1;

            if (newCount >= maxWarns) {
                // Limite atteinte → kick silencieux + reset
                database.setUserData(sender, `ags_warns_${from}`, { count: 0 });
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
            } else {
                // Avertissement
                database.setUserData(sender, `ags_warns_${from}`, { count: newCount });
                await sock.sendMessage(from, {
                    text:     AGM_WARN(senderShort, newCount, maxWarns),
                    mentions: [sender]
                });
            }
        }
    },

    async execute(sock, msg, args, { from, reply, react }) {
        try {
            const settings = database.getGroupSettings(from) || {};
            const enabled  = settings.antigstatus          ?? false;
            const mode     = settings.antigstatusMode      ?? 'delete';
            const maxWarns = settings.antigstatusMaxWarns  ?? 3;

            // ── Pas d'args → statut actuel ──
            if (!args[0]) {
                await react('🛡️');
                return reply(AGM_STATUS(enabled, mode, maxWarns));
            }

            const opt = args[0].toLowerCase();

            // ── ON ──
            if (opt === 'on') {
                database.updateGroupSettings(from, { antigstatus: true });
                await react('✅');
                return reply(AGM_STATUS(true, mode, maxWarns));
            }

            // ── OFF ──
            if (opt === 'off') {
                database.updateGroupSettings(from, { antigstatus: false });
                await react('⚠️');
                return reply(AGM_STATUS(false, mode, maxWarns));
            }

            // ── SET ──
            if (opt === 'set') {
                const sub = args[1]?.toLowerCase();

                // .antigstatus set delete
                if (sub === 'delete') {
                    database.updateGroupSettings(from, {
                        antigstatus:     true,
                        antigstatusMode: 'delete'
                    });
                    await react('🗑️');
                    return reply(AGM_STATUS(true, 'delete', maxWarns));
                }

                // .antigstatus set kick
                if (sub === 'kick') {
                    database.updateGroupSettings(from, {
                        antigstatus:     true,
                        antigstatusMode: 'kick'
                    });
                    await react('🚫');
                    return reply(AGM_STATUS(true, 'kick', maxWarns));
                }

                // .antigstatus set warn <n>
                if (sub === 'warn') {
                    const n = parseInt(args[2]);
                    if (isNaN(n) || n < 1 || n > 10) {
                        return reply(
                            `❌ *${toStyledCaps('ɴᴏᴍʙʀᴇ ɪɴᴠᴀʟɪᴅᴇ')}*\n` +
                            `> ${toStyledCaps('ᴇxᴇᴍᴘʟᴇ')} : \`.antigstatus set warn 3\``
                        );
                    }
                    database.updateGroupSettings(from, {
                        antigstatus:          true,
                        antigstatusMode:      'warn',
                        antigstatusMaxWarns:  n
                    });
                    await react('⚠️');
                    return reply(AGM_STATUS(true, 'warn', n));
                }

                // set invalide
                return reply(
                    `⚠️ *${toStyledCaps('ᴏᴘᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs')}* :\n` +
                    `› \`.antigstatus set delete\`\n` +
                    `› \`.antigstatus set kick\`\n` +
                    `› \`.antigstatus set warn <1-10>\``
                );
            }

            // ── Usage général ──
            return reply(
                `⚠️ *${toStyledCaps('ᴜsᴀɢᴇ')}* :\n` +
                `› \`.antigstatus on/off\`\n` +
                `› \`.antigstatus set delete\`\n` +
                `› \`.antigstatus set kick\`\n` +
                `› \`.antigstatus set warn <1-10>\``
            );

        } catch (err) {
            console.error('[ANTIGSTATUS CMD ERROR]:', err);
            reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
        }
    }
};
