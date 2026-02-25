import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

const antilinkSettings = configmanager.config.antilinkSettings || {};
const warnStorage = configmanager.config.antilinkWarns || {};

// ------------------- HELPERS -------------------
async function getTarget(message, args) {
    return message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null);
}

function saveConfig() {
    configmanager.config.antilinkSettings = antilinkSettings;
    configmanager.config.antilinkWarns = warnStorage;
}

// ------------------- ANTILINK -------------------
export async function antilink(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
        .split(/\s+/).slice(1);
    const action = args[0]?.toLowerCase();

    if (!action) {
        const usage = `🔒 *Antilink*\n\n.antilink on\n.antilink off\n.antilink set delete | kick | warn\n.antilink status`;
        return await send(sock, groupId, { text: usage });
    }

    switch(action) {
        case 'on':
            antilinkSettings[groupId] = antilinkSettings[groupId] || {};
            antilinkSettings[groupId].enabled = true;
            antilinkSettings[groupId].action = antilinkSettings[groupId].action || 'delete';
            saveConfig();
            await send(sock, groupId, { text: '✅ *Antilink activé*' });
            break;
        case 'off':
            delete antilinkSettings[groupId];
            saveConfig();
            await send(sock, groupId, { text: '❌ *Antilink désactivé*' });
            break;
        case 'set':
            if (!args[1] || !['delete','kick','warn'].includes(args[1].toLowerCase())) 
                return await send(sock, groupId, { text: '❌ Usage: .antilink set delete | kick | warn' });
            antilinkSettings[groupId] = antilinkSettings[groupId] || { enabled: true };
            antilinkSettings[groupId].action = args[1].toLowerCase();
            saveConfig();
            await send(sock, groupId, { text: `✅ *Action:* ${args[1].toLowerCase()}` });
            break;
        case 'status':
            const status = antilinkSettings[groupId];
            await send(sock, groupId, { text: `📊 *Statut*\n\nActivé: ${status?.enabled ? '✅' : '❌'}\nAction: ${status?.action || 'Aucune'}` });
            break;
        default:
            await send(sock, groupId, { text: '❌ Usage: .antilink on/off/set/status' });
    }
}

// ------------------- LINK DETECTION -------------------
export async function linkDetection(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    const setting = antilinkSettings[groupId];
    if (!setting?.enabled) return;

    const text = message.message?.conversation
    || message.message?.extendedTextMessage?.text
    || message.message?.imageMessage?.caption
    || '';

    // Regex amélioré pour réduire les faux positifs
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|tiktok\.com|instagram\.com|facebook\.com|whatsapp\.com|chat\.whatsapp\.com|t\.me|telegram\.me|discord\.gg|youtube\.com|youtu\.be)/i;
    if (!linkRegex.test(text)) return;

    try {
        const metadata = await sock.groupMetadata(groupId);
        const sender = metadata.participants.find(p => p.id === senderId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botId);
if (!bot?.admin) return;
        if (!bot?.admin) return; // bot doit être admin

        if (setting.action === 'delete') {
            try { await sock.sendMessage(groupId, { delete: message.key }); } 
            catch (err) { console.error('Antilink delete error:', err); }
        } 
        else if (setting.action === 'kick') {
            await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
            await send(sock, groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]} - Lien détecté`, mentions: [senderId] });
        } 
        else if (setting.action === 'warn') {
            const key = `${groupId}_${senderId}`;
            warnStorage[key] = (warnStorage[key] || 0) + 1;
            saveConfig();
            const warns = warnStorage[key];
            await send(sock, groupId, { text: `🚫 *Lien détecté*\nWarn ${warns}/3\n@${senderId.split('@')[0]}`, mentions: [senderId] });
            if (warns >= 3) {
                await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                await send(sock, groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]}\n3 warns atteints` });
                delete warnStorage[key];
                saveConfig();
            }
        }
    } catch (err) {
        console.error('linkDetection error:', err);
    }
}

// ------------------- WARNS -------------------
export async function resetwarns(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null);

    if (!target) {
        const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId+'_'));
        return await send(sock, groupId, { text: `📊 Warns: ${keys.length} utilisateur(s)\nUsage: .resetwarns @user` });
    }

    const key = `${groupId}_${target}`;
    if (warnStorage[key]) {
        delete warnStorage[key];
        saveConfig();
        await send(sock, groupId, { text: `✅ Warns réinitialisés pour @${target.split('@')[0]}`, mentions: [target] });
    } else {
        await send(sock, groupId, { text: `ℹ️ Aucun warn pour @${target.split('@')[0]}`, mentions: [target] });
    }
}

export async function checkwarns(sock, message) {
    const groupId = message.key.remoteJid;
    const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId+'_'));
    if (!keys.length) return await send(sock, groupId, { text: '✅ Aucun warn.' });

    let report = '📊 *Liste des Warns*\n\n';
    keys.forEach(k => report += `@${k.split('_')[1].split('@')[0]} : ${warnStorage[k]}/3 warns\n`);
    await send(sock, groupId, { text: report, mentions: keys.map(k => k.split('_')[1]) });
}

// ------------------- KICK / PROMOTE / DEMOTE -------------------
export async function kick(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = await getTarget(message, args);
    if (!target) return await send(sock, groupId, { text: '❌ Réponds à un message ou mentionne.' });

    try {
        const metadata = await sock.groupMetadata(groupId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return await send(sock, groupId, { text: '❌ Le bot doit être admin.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'remove');
        await send(sock, groupId, { text: `🚫 @${target.split('@')[0]} exclu.`, mentions: [target] });
    } catch (err) {
        console.error('Kick error:', err);
        await send(sock, groupId, { text: '❌ Erreur' });
    }
}

// ------------------- PROMOTE / DEMOTE -------------------
export async function promote(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = await getTarget(message, args);
    if (!target) return await send(sock, groupId, { text: '❌ Réponds à un message ou mentionne.' });

    try {
        const metadata = await sock.groupMetadata(groupId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return await send(sock, groupId, { text: '❌ Le bot doit être admin.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'promote');
        await send(sock, groupId, { text: `👑 @${target.split('@')[0]} promu admin.`, mentions: [target] });
    } catch (err) {
        console.error('Promote error:', err);
        await send(sock, groupId, { text: '❌ Erreur' });
    }
}

export async function demote(sock, message) {
    const groupId = message.key.remoteJid;

    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
        .split(/\s+/).slice(1);

    const target = message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null);

    if (!target) return await send(sock, groupId, { text: '❌ Réponds à un message ou mentionne.' });

    try {
        const metadata = await sock.groupMetadata(groupId);

        // 🔥 BOT ID FIX
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);

        if (!bot?.admin) {
            return await send(sock, groupId, { text: '❌ Le bot doit être admin.' });
        }

        await sock.groupParticipantsUpdate(groupId, [target], 'demote');

        await send(sock, groupId, { 
            text: `📉 @${target.split('@')[0]} retiré admin.`,
            mentions: [target]
        });

    } catch (err) {
        console.error('Demote error:', err);
        await send(sock, groupId, { text: '❌ Erreur' });
    }
}

// ------------------- GC LINK / JOIN -------------------
export async function gclink(sock, message) {
    const groupId = message.key.remoteJid;
    try {
        const code = await sock.groupInviteCode(groupId);
        await send(sock, groupId, { text: `🔗 Lien du groupe:\nhttps://chat.whatsapp.com/${code}` });
    } catch (err) {
        console.error('GClink error:', err);
        await send(sock, groupId, { text: '❌ Impossible de générer le lien.' });
    }
}

export async function join(sock, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
        if (match) await sock.groupAcceptInvite(match[1]);
    } catch (err) {
        console.error('Join error:', err);
    }
}

// ------------------- MUTE / UNMUTE -------------------
export async function mute(sock, message) {
    const groupId = message.key.remoteJid;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const senderId = message.key.participant || groupId;
        const sender = metadata.participants.find(p => p.id === senderId);
        if (!sender?.admin) return await send(sock, groupId, { text: '❌ Admin uniquement.' });

        await sock.groupSettingUpdate(groupId, 'announcement', true);
        await send(sock, groupId, { text: '🔇 Groupe mute activé.' });
    } catch (err) {
        console.error('Mute error:', err);
        await send(sock, groupId, { text: '❌ Impossible de mute le groupe.' });
    }
}

export async function unmute(sock, message) {
    const groupId = message.key.remoteJid;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const senderId = message.key.participant || groupId;
        const sender = metadata.participants.find(p => p.id === senderId);
        if (!sender?.admin) return await send(sock, groupId, { text: '❌ Admin uniquement.' });

        await sock.groupSettingUpdate(groupId, 'announcement', false);
        await send(sock, groupId, { text: '🔊 Groupe unmute activé.' });
    } catch (err) {
        console.error('Unmute error:', err);
        await send(sock, groupId, { text: '❌ Impossible de unmute le groupe.' });
    }
}

// ------------------- APPROVE ALL -------------------
export async function approveall(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    try {
        const metadata = await sock.groupMetadata(groupId);
        const pending = metadata.participants.filter(p => p.isPending).map(p => p.id);

        if (!pending.length) return await send(sock, groupId, { text: 'ℹ️ Aucune invitation en attente.' });

        for (const id of pending) {
            try { await sock.groupParticipantsUpdate(groupId, [id], 'add'); } 
            catch (e) { console.error('ApproveAll add error:', e); }
        }

        await send(sock, groupId, { text: `✅ Toutes les invitations en attente (${pending.length}) ont été acceptées.` });
    } catch (err) {
        console.error('ApproveAll error:', err);
        await send(sock, groupId, { text: '❌ Impossible de traiter approveall.' });
    }
}

// ------------------- ADD -------------------
export async function add(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    if (!args.length) return await send(sock, groupId, { text: '❌ Mentionne le ou les numéros à ajouter.' });

    for (const num of args) {
        const jid = num.includes('@s.whatsapp.net') ? num : `${num}@s.whatsapp.net`;
        try {
            await sock.groupParticipantsUpdate(groupId, [jid], 'add');
            await send(sock, groupId, { text: `✅ @${jid.split('@')[0]} ajouté au groupe.`, mentions: [jid] });
        } catch (e) {
            console.error('Add error:', e);
            await send(sock, groupId, { text: `❌ Impossible d’ajouter @${jid.split('@')[0]}.`, mentions: [jid] });
        }
    }
}

// ------------------- EXPORT -------------------
export default {
    kick, promote, demote, gclink, join, antilink, linkDetection,
    resetwarns, checkwarns, mute, unmute, approveall, add
};