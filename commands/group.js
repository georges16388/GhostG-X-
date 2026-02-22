import configmanager from '../utils/configmanager.js'

const antilinkSettings = {}
const warnStorage = {}

// ------------------- ANTILINK -------------------
export async function antilink(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return

    try {
        const metadata = await client.groupMetadata(groupId)
        const senderId = message.key.participant || groupId
        const sender = metadata.participants.find(p => p.id === senderId)

        if (!sender?.admin) {
            return await client.sendMessage(groupId, { text: '🔒 *Admins uniquement !*' })
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
        const args = text.split(/\s+/).slice(1)
        const action = args[0]?.toLowerCase()

        if (!action) {
            const usage = `🔒 *-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ - Antilink*\n\n.antilink on\n.antilink off\n.antilink set delete | kick | warn\n.antilink status`
            return await client.sendMessage(groupId, { text: usage })
        }

        switch (action) {
            case 'on':
                antilinkSettings[groupId] = { enabled: true, action: 'delete' }
                await client.sendMessage(groupId, { text: '✅ *Antilink activé*' })
                break

            case 'off':
                delete antilinkSettings[groupId]
                await client.sendMessage(groupId, { text: '❌ *Antilink désactivé*' })
                break

            case 'set':
                if (args.length < 2) return await client.sendMessage(groupId, { text: '❌ Usage: .antilink set delete | kick | warn' })
                const setAction = args[1].toLowerCase()
                if (!['delete', 'kick', 'warn'].includes(setAction)) return await client.sendMessage(groupId, { text: '❌ Actions: delete, kick, warn' })
                antilinkSettings[groupId] = antilinkSettings[groupId] || { enabled: true }
                antilinkSettings[groupId].action = setAction
                await client.sendMessage(groupId, { text: `✅ *Action:* ${setAction}` })
                break

            case 'status':
                const status = antilinkSettings[groupId]
                await client.sendMessage(groupId, { text: `📊 *Statut*\n\nActivé: ${status?.enabled ? '✅' : '❌'}\nAction: ${status?.action || 'Aucune'}` })
                break

            default:
                await client.sendMessage(groupId, { text: '❌ Usage: .antilink on/off/set/status' })
        }
    } catch (error) {
        console.error('Antilink error:', error)
    }
}

// ------------------- LINK DETECTION -------------------
export async function linkDetection(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    const setting = antilinkSettings[groupId]
    if (!setting?.enabled) return

    const senderId = message.key.participant || groupId
    const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || ''

    const linkPatterns = [
        /https?:\/\//i, /www\./i, /\.com\b/i, /\.net\b/i, /\.org\b/i,
        /tiktok\.com/i, /instagram\.com/i, /facebook\.com/i, /whatsapp\.com/i,
        /chat\.whatsapp\.com/i, /t\.me/i, /telegram/i, /discord/i,
        /youtube\.com/i, /youtu\.be/i
    ]

    if (!linkPatterns.some(p => p.test(messageText))) return

    try {
        const metadata = await client.groupMetadata(groupId)
        const sender = metadata.participants.find(p => p.id === senderId)
        const bot = metadata.participants.find(p => p.id.includes(client.user.id.split(':')[0]))

        if (!sender || sender.admin) return
        if (!bot?.admin) return

        if (['delete', 'kick', 'warn'].includes(setting.action)) {
            try { await client.sendMessage(groupId, { delete: message.key }) } catch {}
        }

        const platforms = []
        if (/tiktok\.com/i.test(messageText)) platforms.push('TikTok')
        if (/instagram\.com/i.test(messageText)) platforms.push('Instagram')
        if (/facebook\.com/i.test(messageText)) platforms.push('Facebook')
        if (/whatsapp\.com/i.test(messageText)) platforms.push('WhatsApp')
        if (/t\.me|telegram/i.test(messageText)) platforms.push('Telegram')
        if (/discord/i.test(messageText)) platforms.push('Discord')
        if (/youtube\.com|youtu\.be/i.test(messageText)) platforms.push('YouTube')
        if (platforms.length === 0) platforms.push('Site Web')

        const warnKey = `${groupId}_${senderId}`
        if (setting.action === 'warn') {
            warnStorage[warnKey] = (warnStorage[warnKey] || 0) + 1
            const warns = warnStorage[warnKey]
            await client.sendMessage(groupId, { text: `🚫 *Lien ${platforms.join('/')}*\nWarn ${warns}/3\n@${senderId.split('@')[0]}`, mentions: [senderId] })
            if (warns >= 3) {
                await client.groupParticipantsUpdate(groupId, [senderId], 'remove')
                await client.sendMessage(groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]}\n3 warns atteints` })
                delete warnStorage[warnKey]
            }
        } else if (setting.action === 'kick') {
            await client.groupParticipantsUpdate(groupId, [senderId], 'remove')
            await client.sendMessage(groupId, { text: `⚡ *Expulsé*\n@${senderId.split('@')[0]}\nRaison: Lien ${platforms.join('/')}`, mentions: [senderId] })
        } else {
            await client.sendMessage(groupId, { text: `🚫 *Lien supprimé*\n@${senderId.split('@')[0]} - ${platforms.join('/')}`, mentions: [senderId] })
        }
    } catch (e) { console.error('LinkDetection error:', e) }
}

// ------------------- WARNS -------------------
export async function resetwarns(client, message) {
    const groupId = message.key.remoteJid
    const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(/\s+/).slice(1)
    let target = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ? message.message.extendedTextMessage.contextInfo.participant
        : args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null

    if (!target) {
        const warnKeys = Object.keys(warnStorage).filter(k => k.startsWith(groupId + '_'))
        return await client.sendMessage(groupId, { text: `📊 *Warns:* ${warnKeys.length} utilisateur(s)\n\nUsage: .resetwarns @user` })
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
    const keys = Object.keys(warnStorage).filter(k => k.startsWith(groupId + '_'))
    if (keys.length === 0) return await client.sendMessage(groupId, { text: '✅ Aucun warn dans ce groupe.' })

    let report = '📊 *Liste des Warns*\n\n'
    keys.forEach(k => report += `@${k.split('_')[1].split('@')[0]} : ${warnStorage[k]}/3 warns\n`)
    await client.sendMessage(groupId, { text: report })
}

// ------------------- KICK / PROMOTE / DEMOTE -------------------
async function getTarget(message, args) {
    return message.message?.extendedTextMessage?.contextInfo?.participant
        || (args[0] ? args[0].replace('@','') + '@s.whatsapp.net' : null)
}

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
        await client.sendMessage(groupId, { text: '⚡ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ- Purge...' })
        for (const t of targets) try { await client.groupParticipantsUpdate(groupId, [t], 'remove') } catch {}
        await client.sendMessage(groupId, { text: '✅ Purge terminée.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

export async function kickall2(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    try {
        const metadata = await client.groupMetadata(groupId)
        const targets = metadata.participants.filter(p => !p.admin).map(p => p.id)
        await client.sendMessage(groupId, { text: '⚡ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ- One Shot...' })
        await client.groupParticipantsUpdate(groupId, targets, 'remove')
        await client.sendMessage(groupId, { text: '✅ Ils ont tous été exclus, Patron.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Erreur' }) }
}

export async function promote(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
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
    if (!groupId.includes('@g.us')) return
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
    if (!groupId.includes('@g.us')) return
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
    if (!groupId.includes('@g.us')) return
    try {
        const metadata = await client.groupMetadata(groupId)
        const senderId = message.key.participant || groupId
        const sender = metadata.participants.find(p => p.id === senderId)
        if (!sender?.admin) return await client.sendMessage(groupId, { text: '❌ Admin uniquement.' })
        await client.groupSettingUpdate(groupId, 'announcement')
        await client.sendMessage(groupId, { text: '🔇 Groupe mute : seuls les Ghosts peuvent envoyer des messages.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Impossible de mute le groupe.' }) }
}

export async function unmute(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    try {
        const metadata = await client.groupMetadata(groupId)
        const senderId = message.key.participant || groupId
        const sender = metadata.participants.find(p => p.id === senderId)
        if (!sender?.admin) return await client.sendMessage(groupId, { text: '❌ Admin uniquement.' })
        await client.groupSettingUpdate(groupId, 'not_announcement')
        await client.sendMessage(groupId, { text: '🔊 Groupe unmute : tous les membres peuvent envoyer des messages, même les faibles.' })
    } catch { await client.sendMessage(groupId, { text: '❌ Impossible de unmute le groupe.' }) }
}

// ------------------- EXPORT -------------------
export default {
    kick, kickall, kickall2, promote, demote,
    gclink, join, antilink, linkDetection,
    resetwarns, checkwarns, mute, unmute
}