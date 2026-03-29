ANTI-GROUP STATUS COMMAND - AGM SYSTEM CORE
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Auto-delete group statuses + warn + kick repeat violators
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

const AGM_STATUS = (status, maxWarns) =>
    `*╭╼━≪• ${toStyledCaps('ᴀɴᴛɪ-ɢsᴛᴀᴛᴜs')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🛡️ *${toStyledCaps('sᴛᴀᴛᴜs')}*    : ${status === 'on' ? '🟢' : '🔴'} *${toStyledCaps(status === 'on' ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅɪsᴀʙʟᴇᴅ')}*\n` +
    `*┃* ⚠️ *${toStyledCaps('ᴍᴀx ᴡᴀʀɴs')}* : *${maxWarns}*\n` +
    `*┃* ⚙️ *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}*    : *${toStyledCaps('ᴅᴇʟᴇᴛᴇ → ᴡᴀʀɴ → ᴋɪᴄᴋ')}*\n` +
    `*┃* 🌐 *${toStyledCaps('sᴄᴏᴘᴇ')}*     : *${toStyledCaps('ɢʀᴏᴜᴘ ᴏɴʟʏ')}*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

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

const AGM_KICK = (senderShort) =>
    `*╭╼━≪• ${toStyledCaps('ᴀɴᴛɪ-ɢsᴛᴀᴛᴜs ᴋɪᴄᴋ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🚫 *${toStyledCaps('ᴀᴄᴛɪᴏɴ')}*  : *${toStyledCaps('ᴇxᴘᴜʟsɪᴏɴ')}*\n` +
    `*┃* 👤 *${toStyledCaps('ᴜsᴇʀ')}*    : @${senderShort}\n` +
    `*┃* ❌ *${toStyledCaps('ʀᴀɪsᴏɴ')}*  : *${toStyledCaps('ᴡᴀʀɴɪɴɢs ᴍᴀx ᴀᴛᴛᴇɪɴᴛ')}*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

// ─────────────────────────────────────────────
// DÉTECTION GROUP STATUS
// ─────────────────────────────────────────────

/**
 * Retourne true si le message est un "Group Status"
 * (forwarded depuis un status/broadcast Baileys)
 */
const isGroupStatus = (msg) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo
             ?? msg.message?.imageMessage?.contextInfo
             ?? msg.message?.videoMessage?.contextInfo
             ?? msg.message?.documentMessage?.contextInfo
             ?? null;

    if (!ctx) return false;

    // Un "group status" est un message forwardé depuis un broadcast/status
    const isForwarded    = ctx.isForwarded === true || ctx.forwardingScore > 0;
    const fromBroadcast  = ctx.remoteJid?.includes('broadcast') ||
                           ctx.remoteJid?.includes('status');
    const hasStatusMark  = msg.message?.extendedTextMessage?.text?.includes('status') ||
                           msg.message?.conversation?.includes('status');

    return isForwarded && (fromBroadcast || hasStatusMark);
};

// ─────────────────────────────────────────────
// COMMANDE
// ─────────────────────────────────────────────

module.exports = {
    name:        'antigstatus',
    aliases:     ['ags', 'antigs', 'antigroupstatus'],
    category:    'admin',
    description: 'Supprime les group statuses, avertit et expulse les récidivistes.',
    usage:       '.antigstatus on/off | .antigstatus warns <1-10>',
    groupOnly:   true,
    adminOnly:   true,

    // ── Fonction exposée pour le handler ──
    checkAndHandle: async (sock, msg, { from, sender, isBotAdmin, database }) => {
        const groupSettings = database.getGroupSettings(from) || {};
        if (!groupSettings.antigstatus) return;
        if (!isGroupStatus(msg))        return;
        if (!isBotAdmin)                return;

        const maxWarns    = groupSettings.antigstatusMaxWarns ?? 3;
        const warnsKey    = `antigstatus_warns_${from}`;
        const userWarns   = database.getUserData(sender, warnsKey) || {};
        const senderShort = sender.split('@')[0];

        // Supprimer le message
        await sock.sendMessage(from, { delete: msg.key });

        // Incrémenter les warnings
        const currentWarn = (userWarns.count || 0) + 1;
        database.setUserData(sender, warnsKey, { count: currentWarn });

        if (currentWarn >= maxWarns) {
            // Kick + reset warns
            database.setUserData(sender, warnsKey, { count: 0 });
            await sock.sendMessage(from, {
                text:     AGM_KICK(senderShort),
                mentions: [sender]
            });
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
        } else {
            // Avertissement
            await sock.sendMessage(from, {
                text:     AGM_WARN(senderShort, currentWarn, maxWarns),
                mentions: [sender]
            });
        }
    },

    async execute(sock, msg, args, { from, reply, react }) {
        try {
            const settings  = database.getGroupSettings(from) || {};
            const status    = settings.antigstatus ? 'on' : 'off';
            const maxWarns  = settings.antigstatusMaxWarns ?? 3;

            // ── Pas d'args → afficher statut actuel ──
            if (!args[0]) {
                await react('🛡️');
                return reply(AGM_STATUS(status, maxWarns));
            }

            const opt = args[0].toLowerCase();

            // ── ON ──
            if (opt === 'on' || opt === 'active') {
                database.updateGroupSettings(from, { antigstatus: true });
                await react('✅');
                return reply(AGM_STATUS('on', maxWarns));
            }

            // ── OFF ──
            if (opt === 'off' || opt === 'disable') {
                database.updateGroupSettings(from, { antigstatus: false });
                await react('⚠️');
                return reply(AGM_STATUS('off', maxWarns));
            }

            // ── SET MAX WARNS ──
            if (opt === 'warns') {
                const n = parseInt(args[1]);
                if (isNaN(n) || n < 1 || n > 10) {
                    return reply(
                        `❌ *${toStyledCaps('ᴠᴀʟᴇᴜʀ ɪɴᴠᴀʟɪᴅᴇ')}*\n` +
                        `> ${toStyledCaps('ᴇɴᴛʀᴇ ᴜɴ ɴᴏᴍʙʀᴇ ᴇɴᴛʀᴇ 1 ᴇᴛ 10')}`
                    );
                }
                database.updateGroupSettings(from, {
                    antigstatus:          true,
                    antigstatusMaxWarns:  n
                });
                await react('⚙️');
                return reply(AGM_STATUS('on', n));
            }

            return reply(
                `⚠️ *${toStyledCaps('ᴜsᴀɢᴇ')}* :\n` +
                `› *.antigstatus on/off*\n` +
                `› *.antigstatus warns <1-10>*`
            );

        } catch (err) {
            console.error('[ANTIGSTATUS CMD ERROR]:', err);
            reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
        }
    }
};