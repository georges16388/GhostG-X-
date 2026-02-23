import configmanager from '../utils/configmanager.js'

const antilinkSettings = {}
const warnStorage = {}

// ------------------- HELPERS -------------------
async function getTarget(message, args) {
    return message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null)
}

// ------------------- ANTILINK -------------------
export async function antilink(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return

    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    const action = args[0]?.toLowerCase()
    if (!action) {
        const usage = `🔒 *-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ - Antilink*\n\n.antilink on\n.antilink off\n.antilink set delete | kick | warn\n.antilink status`
        return await client.sendMessage(groupId, { text: usage })
    }

    switch(action) {
        case 'on':
            antilinkSettings[groupId] = { enabled: true, action: 'delete' }
            await client.sendMessage(groupId, { text: '✅ *Antilink activé*' })
            break
        case 'off':
            delete antilinkSettings[groupId]
            await client.sendMessage(groupId, { text: '❌ *Antilink désactivé*' })
            break
        case 'set':
            if (!args[1] || !['delete','kick','warn'].includes(args[1].toLowerCase())) 
                return await client.sendMessage(groupId, { text: '❌ Usage: .antilink set delete | kick | warn' })
            antilinkSettings[groupId] = antilinkSettings[groupId] || { enabled: true }
            antilinkSettings[groupId].action = args[1].toLowerCase()
            await client.sendMessage(groupId, { text: `✅ *Action:* ${args[1].toLowerCase()}` })
            break
        case 'status':
            const status = antilinkSettings[groupId]
            await client.sendMessage(groupId, { text: `📊 *Statut*\n\nActivé: ${status?.enabled ? '✅' : '❌'}\nAction: ${status?.action || 'Aucune'}` })
            break
        default:
            await client.sendMessage(groupId, { text: '❌ Usage: .antilink on/off/set/status' })
    }
}

// ------------------- LINK DETECTION -------------------
export async function linkDetection(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    const setting = antilinkSettings[groupId]
    if (!setting?.enabled) return

    const senderId = message.key.participant || groupId
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ''

    const linkRegex = /(https?:\/\/|www\.|\.com|\.net|\.org|tiktok\.com|instagram\.com|facebook\.com|whatsapp\.com|chat\.whatsapp\.com|t\.me|telegram|discord|youtube\.com|youtu\.be)/i
    if (!linkRegex.test(text)) return

    const metadata = await client.groupMetadata(groupId)
    const sender = metadata.participants.find(p => p.id === senderId)
    const bot = metadata.participants.find(p => p.id.includes(client.user.id.split(':')[0]))
    if (!sender || sender.admin) return
    if (!bot?.admin) return

    if (setting.action === 'delete') {
        try { await client.sendMessage(groupId, { delete: message.key }) } catch {}
    } else if (setting.action === 'kick') {
        await client.groupParticipantsUpdate(groupId, [senderId], 'remove')
        await client.sendMessage(groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]} - Lien détecté`, mentions: [senderId] })
    } else if (setting.action === 'warn') {
        const key = `${groupId}_${senderId}`
        warnStorage[key] = (warnStorage[key] || 0) + 1
        const warns = warnStorage[key]
        await client.sendMessage(groupId, { text: `🚫 *Lien détecté*\nWarn ${warns}/3\n@${senderId.split('@')[0]}`, mentions: [senderId] })
        if (warns >= 3) {
            await client.groupParticipantsUpdate(groupId, [senderId], 'remove')
            await client.sendMessage(groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]}\n3 warns atteints` })
            delete warnStorage[key]
        }
    }
}

// ------------------- WARNS -------------------
export async function resetwarns(client, message) {
    const groupId = message.key.remoteJid
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    const target = message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null)

    if (!target) {
        const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId+'_'))
        return await client.sendMessage(groupId, { text: `📊 Warns: ${keys.length} utilisateur(s)\nUsage: .resetwarns @user` })
    }

    const key = `${groupId}_${target}`
    if (warnStorage[key]) {
        delete warnStorage[key]
        await client.sendMessage(groupId, { text: `✅ Warns réinitialisés pour @${target.split('@')[0]}` })
    } else {
        await client.sendMessage(groupId, { text: `ℹ️ Aucun warn pour @${target.split('@')[0]}` })
    }
}

export async function checkwarns(client, message) {
    const groupId = message.key.remoteJid
    const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId+'_'))
    if (!keys.length) return await client.sendMessage(groupId, { text: '✅ Aucun warn.' })

    let report = '📊 *Liste des Warns*\n\n'
    keys.forEach(k => report += `@${k.split('_')[1].split('@')[0]} : ${warnStorage[k]}/3 warns\n`)
    await client.sendMessage(groupId, { text: report })
}

// ------------------- KICK / PROMOTE / DEMOTE -------------------
export async function kick(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    const target = await getTarget(message, args)
    if (!target) return await client.sendMessage(groupId, { text: '❌ Réponds à un message ou mentionne.' })

    try {
        await client.groupParticipantsUpdate(groupId, [target], 'remove')
        await client.sendMessage(groupId, { text: `🚫 @${target.split('@')[0]} exclu.` })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

export async function kickall(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    try {
        const metadata = await client.groupMetadata(groupId)
        const targets = metadata.participants.filter(p => !p.admin).map(p => p.id)
        await client.groupParticipantsUpdate(groupId, targets, 'remove')
        await client.sendMessage(groupId, { text: '✅ Tous les membres non-admin ont été exclus.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

export async function promote(client, message) {
    const groupId = message.key.remoteJid
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    const target = await getTarget(message, args)
    if (!target) return await client.sendMessage(groupId, { text: '❌ Réponds à un message ou mentionne.' })

    try {
        await client.groupParticipantsUpdate(groupId, [target], 'promote')
        await client.sendMessage(groupId, { text: `👑 @${target.split('@')[0]} promu admin.` })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

export async function demote(client, message) {
    const groupId = message.key.remoteJid
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    const target = await getTarget(message, args)
    if (!target) return await client.sendMessage(groupId, { text: '❌ Réponds à un message ou mentionne.' })

    try {
        await client.groupParticipantsUpdate(groupId, [target], 'demote')
        await client.sendMessage(groupId, { text: `📉 @${target.split('@')[0]} retiré admin.` })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

// ------------------- GC LINK / JOIN -------------------
export async function gclink(client, message) {
    const groupId = message.key.remoteJid
    try {
        const code = await client.groupInviteCode(groupId)
        await client.sendMessage(groupId, { text: `🔗 Lien du groupe:\nhttps://chat.whatsapp.com/${code}` })
    } catch { await client.sendMessage(groupId, { text: '❌ Impossible de générer le lien.' }) }
}

export async function join(client, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
        const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
        if (match) await client.groupAcceptInvite(match[1])
    } catch {}
}

// ------------------- MUTE / UNMUTE -------------------
export async function mute(client, message) {
    const groupId = message.key.remoteJid
    try {
        const metadata = await client.groupMetadata(groupId)
        const senderId = message.key.participant || groupId
        const sender = metadata.participants.find(p => p.id === senderId)
        if (!sender?.admin) return await client.sendMessage(groupId, { text: '❌ Admin uniquement.' })
        await client.groupSettingUpdate(groupId, 'announcement')
        await client.sendMessage(groupId, { text: '🔇 Groupe mute activé.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Impossible de mute le groupe.' }) }
}

export async function unmute(client, message) {
    const groupId = message.key.remoteJid
    try {
        const metadata = await client.groupMetadata(groupId)
        const senderId = message.key.participant || groupId
        const sender = metadata.participants.find(p => p.id === senderId)
        if (!sender?.admin) return await client.sendMessage(groupId, { text: '❌ Admin uniquement.' })
        await client.groupSettingUpdate(groupId, 'not_announcement')
        await client.sendMessage(groupId, { text: '🔊 Groupe unmute activé.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Impossible de unmute le groupe.' }) }
}
// ------------------- APPROVE ALL -------------------
export async function approveall(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return

    try {
        const metadata = await client.groupMetadata(groupId)
        // Filtre uniquement les participants avec un statut "invite" en attente
        const pending = metadata.participants.filter(p => p.admin === 'pending').map(p => p.id)

        if (pending.length === 0) return await client.sendMessage(groupId, { text: 'ℹ️ Aucune invitation en attente.' })

        for (const id of pending) {
            try { 
                await client.groupParticipantsUpdate(groupId, [id], 'add') 
            } catch (e) { console.error('Erreur approveall:', e) }
        }

        await client.sendMessage(groupId, { text: `✅ Toutes les invitations en attente (${pending.length}) ont été acceptées.` })
    } catch (error) {
        console.error('approveall error:', error)
        await client.sendMessage(groupId, { text: '❌ Impossible de traiter approveall.' })
    }
}
// ------------------- EXPORT -------------------
export default {
    kick, kickall, promote, demote,
    gclink, join, antilink, linkDetection,
    resetwarns, checkwarns, mute, unmute
}