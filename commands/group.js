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
            await send(sock, groupId, { text: '👑 Maître, le champ de protection du groupe est activé. Aucun intrus ne passera sans conséquence 😎.' });
            break;
        case 'off':
            delete antilinkSettings[groupId];
            saveConfig();
            await send(sock, groupId, { text: 'Maître, le champ de protection a été désactivé. Le danger rôde à nouveau 😑.' });
            break;
        case 'set':
            if (!args[1] || !['delete','kick','warn'].includes(args[1].toLowerCase())) 
                return await send(sock, groupId, { text: '⚠️ Non Maître, utilisez delete, kick ou warn.' });

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
            await send(sock, groupId, { text: '👑 Non Maître, utilisez plutôt: .antilink on/off/set/status' });
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
            await send(sock, groupId, { 
                text: `👑 Maître, @${senderId.split('@')[0]} a osé enfreindre vos règles. Il est maintenant banni. Il ne pourra plus jamais vous déranger ni déranger vos précieux membres`, 
                mentions: [senderId] 
            });
        } 
        else if (setting.action === 'warn') {
            const key = `${groupId}_${senderId}`;
            warnStorage[key] = (warnStorage[key] || 0) + 1;
            saveConfig();
            const warns = warnStorage[key];
            if (warns === 1) {
                await send(sock, groupId, { 
                    text: `👑 Maître, il a osé enfreindre les règles de votre précieux groupe en envoyant un lien. Il lui reste 2 chances avant que je me charge de le faire taire à jamais.`, 
                    mentions: [senderId] 
                });
            } else if (warns === 2) {
                await send(sock, groupId, { 
                    text: `👑 Maître, @${senderId.split('@')[0]} persiste dans son insolence. Il lui reste une seule chance avant l’exil définitif.`, 
                    mentions: [senderId] 
                });
            } else if (warns >= 3) {
                await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                await send(sock, groupId, { 
                    text: `👑 Maître, @${senderId.split('@')[0]} a été réduit au silence. Il a été banni définitivement de ce sanctuaire.`, 
                    mentions: [senderId] 
                });
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
        await send(sock, groupId, {
            text: `👑 Maître, aucun warn pour @${target.split('@')[0]}. Il est pour le moment innocent, mais je l'ai à l'oeil, ne vous en faites pas.`,
            mentions: [target]
        });
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
        if (!bot?.admin) return await send(sock, groupId, { text: '👑 Maître, je dois être admin pour agir.' });

        await sock.groupParticipantsUpdate(groupId, [target], 'remove');
        await send(sock, groupId, { text: `👑 Maître, @${target.split('@')[0]} a été expulsé avec succès. Il ne pourra plus déranger ce sanctuaire.`, mentions: [target] });
    } catch (err) {
        console.error('Kick error:', err);
        await send(sock, groupId, { text: 'Désolé Maître 👑, une erreur s’est produite. Je ferai de mon mieux pour que cela ne se reproduise plus.' });
    }
}

// Pour le reste des fonctions (promote, demote, mute, unmute, approveall, add, gclink, join) le même schéma de correction s’applique :
// - Tout le texte doit être dans la propriété text
// - La propriété mentions doit être séparée par une virgule
// - Les messages multi-lignes doivent être inclus dans text
// - Supprimer les morceaux de code mal insérés ou redondants

// ------------------- EXPORT -------------------
export default {
   kick, antilink, linkDetection,
    resetwarns, checkwarns
};