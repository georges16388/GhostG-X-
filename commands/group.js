import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

// Configs
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
            await send(sock, groupId, { text: '👑Maître, le champ de protection du groupe est activé. Aucun intrus ne passera sans conséquence😎.' });
            break;
        case 'off':
            delete antilinkSettings[groupId];
            saveConfig();
            await send(sock, groupId, { text: 'Maître, le champ de protection a été désactivé. Le danger rôde à nouveau 😑.' });
            break;
        case 'set':
            if (!args[1] || !['delete','kick','warn'].includes(args[1].toLowerCase())) 
                return await send(sock, groupId, { text: '👑Maître, c'est plutôt comme ça que vous devez l'utiliser: .antilink set delete | kick | warn' });
            antilinkSettings[groupId] = antilinkSettings[groupId] || { enabled: true };
            antilinkSettings[groupId].action = args[1].toLowerCase();
            saveConfig();
            await send(sock, groupId, { text: `👑 Maître, l’action en cas d’infraction est maintenant: *${args[1].toLowerCase()}*` });
            break;
        case 'status':
            const status = antilinkSettings[groupId];
            await send(sock, groupId, { text: `📊 *Statut du champ de protection*\n\nActivé: ${status?.enabled ? '✅' : '❌'}\nAction: ${status?.action || 'Aucune'}` });
            break;
        default:
            await send(sock, groupId, { text: '👑 Non Maître, utiliser le plutôt comme ça: .antilink on/off/set/status' });
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

    // Regex liens
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|tiktok\.com|instagram\.com|facebook\.com|whatsapp\.com|chat\.whatsapp\.com|t\.me|telegram\.me|discord\.gg|youtube\.com|youtu\.be)/i;
    if (!linkRegex.test(text)) return;

    try {
        const metadata = await sock.groupMetadata(groupId);
        const senderId = message.key.participant || message.key.remoteJid;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return;

        if (setting.action === 'delete') {
            try { await sock.sendMessage(groupId, { delete: message.key }); } 
            catch (err) { console.error('Antilink delete error:', err); }
        } 
        else if (setting.action === 'kick') {
            await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
            await send(sock, groupId, { text: `👑Maître, @${senderId.split('@')[0]} a osé enfreindre vos règles. Il est maintenant banni. Il ne pourra plus jamais vous déranger ni déranger vos précieux membres`, mentions: [senderId] });
        } 
        else if (setting.action === 'warn') {
            const key = `${groupId}_${senderId}`;
            warnStorage[key] = (warnStorage[key] || 0) + 1;
            saveConfig();
            const warns = warnStorage[key];
            if (warns === 1) {
                await send(sock, groupId, { text: `👑 Maître, il a osé enfreindre les règles de votre précieux groupe en envoyant un lien. Il lui reste 2 chances avant que je me charge de le faire taire à jamais.`, mentions: [senderId] });
            } else if (warns === 2) {
                await send(sock, groupId, { text: `👑 Maître, @${senderId.split('@')[0]} persiste dans son insolence. Il lui reste une seule chance avant l’exil définitif.`, mentions: [senderId] });
            } else if (warns >= 3) {
                await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                await send(sock, groupId, { text: `👑Maître, @${senderId.split('@')[0]} a été réduit au silence. Il a été banni définitivement de ce sanctuaire.`, mentions: [senderId] });
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
        return await send(sock, groupId, { text: `👑 Maître, warns: ${keys.length} utilisateur(s)\nUsage: .resetwarns @user` });
    }

    const key = `${groupId}_${target}`;
    if (warnStorage[key]) {
        delete warnStorage[key];
        saveConfig();
        await send(sock, groupId, { text: `👑 Maître, warns réinitialisés pour @${target.split('@')[0]}`, mentions: [target] });
    } else {
        await send(sock, groupId, { text: `👑 Maître, aucun warn pour @${target.split('@')[0]}`, mentions: [target] Il est pour le moment innocent, mais je l'ai à l'oeil, ne vous en faites pas.});
    }
}

export async function checkwarns(sock, message) {
    const groupId = message.key.remoteJid;
    const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId+'_'));
    if (!keys.length) return await send(sock, groupId, { text: '✅ Maître, aucun warn dans votre sanctuaire.' });

    let report = '📊 *Liste des Warns*\n\n';
    keys.forEach(k => report += `@${k.split('_')[1].split('@')[0]} : ${warnStorage[k]}/3 warns\n`);
    await send(sock, groupId, { text: report, mentions: keys.map(k => k.split('_')[1]) });
}

// ------------------- KICK / PROMOTE / DEMOTE -------------------
export async function kick(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = await getTarget(message, args);
    if (!target) return await send(sock, groupId, { text: '👑 Maître, vous devez répondre à un message ou mentionner un membre.' });

    try {
        const metadata = await sock.groupMetadata(groupId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return await send(sock, groupId, { text: '👑Maître, je dois être admin pour agir.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'remove');
        await send(sock, groupId, { text: `👑 Maître, @${target.split('@')[0]} a été expulsé avec succès. Il ne pourra plus déranger ce sanctuaire.`, mentions: [target] });
    } catch (err) {
        console.error('Kick error:', err);
        await send(sock, groupId, { text: 'Désolez Maître 👑, une erreur s’est produite. Je ferai de mon mieux pour que cela ne se produise plus.' });
    }
}

export async function promote(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = await getTarget(message, args);
    if (!target) return await send(sock, groupId, { text: '👑Maître, vous devez répondre à un message ou mentionner un membre.' });

    try {
        const metadata = await sock.groupMetadata(groupId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return await send(sock, groupId, { text: '❌ Maître, je dois être admin pour agir.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'promote');
        await send(sock, groupId, { text: `👑 Maître, @${target.split('@')[0]} est désormais gardien de ce sanctuaire. Mais je garde un œil sur lui, ne vous en faites pas.`, mentions: [target] });
    } catch (err) {
        console.error('Promote error:', err);
        await send(sock, groupId, { text: 'Désolé Maître 👑,mais une erreur s’est produite. Je veillerai à ce que cela n'arrive plus...
Veuillez réessayer s'il vous plaît' });
    }
}

export async function demote(sock, message) {
    const groupId = message.key.remoteJid;
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    const target = await getTarget(message, args);
    if (!target) return await send(sock, groupId, { text: '👑 Maître, vous devez répondre à un message ou mentionner un membre.' });

    try {
        const metadata = await sock.groupMetadata(groupId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        if (!bot?.admin) return await send(sock, groupId, { text: '👑 Maître, je dois être admin pour agir.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'demote');
        await send(sock, groupId, { text: `👑 Maître, @${target.split('@')[0]} a perdu ses privilèges dans ce sanctuaire.`, mentions: [target] });
    } catch (err) {
        console.error('Demote error:', err);
        await send(sock, groupId, { text: 'Désolé Maître 👑, mais une une erreur s’est produite. Je veillerai à ce que cela ne se produise plus.
Veuillez cependant réessayer ' });
    }
}

// ------------------- GC LINK / JOIN -------------------
export async function gclink(sock, message) {
    const groupId = message.key.remoteJid;
    try {
        const code = await sock.groupInviteCode(groupId);
        await send(sock, groupId, { text: `🔗 Maître, lien du sanctuaire:\nhttps://chat.whatsapp.com/${code}` });
    } catch (err) {
        console.error('GClink error:', err);
        await send(sock, groupId, { text: '👑 Maître, je n'arrive pas de générer le lien.' });
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
        if (!sender?.admin) return await send(sock, groupId, { text: 'Désolé Maître 👑,mais seulement ceux sont admins du groupe peuvent activer cette fonction.' });

        await sock.groupSettingUpdate(groupId, 'announcement', true);
        await send(sock, groupId, { text: '👑 Maître, les âmes bruyantes ont été réduites au silence.' });
    } catch (err) {
        console.error('Mute error:', err);
        await send(sock, groupId, { text: '👑 Maître, je n'arrive pas à faire taire ces âmes bruyantes.' });
    }
}

export async function unmute(sock, message) {
    const groupId = message.key.remoteJid;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const senderId = message.key.participant || groupId;
        const sender = metadata.participants.find(p => p.id === senderId);
        if (!sender?.admin) return await send(sock, groupId, { text: 'Désolé Maître 👑,mais seulement ceux sont admins du groupe peuvent activer cette fonction.' });

        await sock.groupSettingUpdate(groupId, 'announcement', false);
        await send(sock, groupId, { text: '🔊 Maître, les murmures sont autorisés à nouveau.' });
    } catch (err) {
        console.error('Unmute error:', err);
        await send(sock, groupId, { text: '👑 Maître, je n'arrive pas à faire taire ces âmes bruyantes.' });
    }
}

// ------------------- APPROVE ALL -------------------
export async function approveall(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    try {
        const metadata = await sock.groupMetadata(groupId);
        const pending = metadata.participants.filter(p => p.isPending).map(p => p.id);

        if (!pending.length) return await send(sock, groupId, { text: '👑 Maître, aucune âme n’attend encore votre permission pour entrer dans ce sanctuaire.' });

        for (const id of pending) {
            try { await sock.groupParticipantsUpdate(groupId, [id], 'add'); } 
            catch (e) { console.error('ApproveAll add error:', e); }
        }

        await send(sock, groupId, { text: `👑 Maître, toutes les âmes en attente (${pending.length}) ont été admises dans votre sanctuaire.` });
    } catch (err) {
        console.error('ApproveAll error:', err);
        await send(sock, groupId, { text: '👑 Maître, je n'arrive pas à autoriser la permission aux âmes en attente.' });
    }
}

// ------------------- ADD -------------------
export async function add(sock, message) {
    const groupId = message.key.remoteJid;
    if (!groupId.includes('@g.us')) return;

    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1);
    if (!args.length) return await send(sock, groupId, { text: '👑 Maître, mentionnez le ou les numéros à ajouter à votre sanctuaire.' });

    for (const num of args) {
        const jid = num.includes('@s.whatsapp.net') ? num : `${num}@s.whatsapp.net`;
        try {
            await sock.groupParticipantsUpdate(groupId, [jid], 'add');
            await send(sock, groupId, { text: `👑 Maître, @${jid.split('@')[0]} a été invité à rejoindre votre royaume.`, mentions: [jid] });
        } catch (e) {
            console.error('Add error:', e);
            await send(sock, groupId, { text: `👑 Maître, je n'arrive pas à ajouter @${jid.split('@')[0]}.`, mentions: [jid] à votre sanctuaire.});
        }
    }
}

// ------------------- EXPORT -------------------
export default {
    kick, promote, demote, gclink, join, antilink, linkDetection,
    resetwarns, checkwarns, mute, unmute, approveall, add
};