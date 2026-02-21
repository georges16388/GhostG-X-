import configmanager from "../utils/configmanager.js"
import fs from 'fs/promises'
import group from '../commands/group.js'
import block from '../commands/block.js'
import viewonce from '../commands/viewonce.js'
import tiktok from '../commands/tiktok.js'
import play from '../commands/play.js'
import sudo from '../commands/sudo.js'
import tag from '../commands/tag.js'
import take from '../commands/take.js'
import sticker from '../commands/sticker.js'
import img from '../commands/img.js'
import url from '../commands/url.js'
import sender from '../commands/sender.js'
import fuck from '../commands/fuck.js'
import bug from '../commands/bug.js'
import dlt from '../commands/dlt.js'
import save from '../commands/save.js'
import pp from '../commands/pp.js'
import premiums from '../commands/premiums.js'
import reactions from '../commands/reactions.js'
import media from '../commands/media.js'
import set from '../commands/set.js'
import fancy from '../commands/fancy.js'
import react from "../utils/react.js"
import info from "../commands/menu.js"
import { pingTest } from "../commands/ping.js"
import auto from '../commands/auto.js'
import uptime from '../commands/uptime.js'

async function safeCommand(client, message, fn, ...args) {
    try {
        await fn(client, message, ...args)
    } catch (err) {
        console.error('Erreur commande:', err)
        try {
            await client.sendMessage(
                message.key.remoteJid,
                { text: `❌ Une erreur est survenue : ${err.message}` }
            )
        } catch (_) { }
    }
}

async function handleIncomingMessage(client, event) {
    const lid = client?.user?.lid.split(':')[0] + '@lid'
    const number = client.user.id.split(':')[0]
    const messages = event.messages
    const publicMode = configmanager.config.users[number].publicMode
    const prefix = configmanager.config.users[number].prefix
    const approvedUsers = configmanager.config.users[number].sudoList

    for (const message of messages) {
        const messageBody = (message.message?.extendedTextMessage?.text ||
                             message.message?.conversation || '').toLowerCase()
        const remoteJid = message.key.remoteJid
        if (!messageBody || !remoteJid) continue

        console.log('📨 Message:', messageBody.substring(0, 50))

        // --- Actions automatiques ---
        safeCommand(client, message, auto.autotype)
        safeCommand(client, message, auto.autorecord)
        safeCommand(client, message, tag.respond)
        safeCommand(client, message, reactions.auto,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )

        // --- Anti-link toujours actif ---
        await safeCommand(client, message, group.antilink)

        // --- Anti-mention GC ---
        if (configmanager.config.groups[remoteJid]?.antimentiongc) {
            const antimention = configmanager.config.groups[remoteJid].antimentiongc
            if (antimention.on && message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                if (antimention.delete) {
                    await client.deleteMessage(remoteJid, { id: message.key.id, remoteJid })
                }
                if (antimention.kick) {
                    await group.kick(client, message, message.key.participant)
                }
            }
        }

        // --- Vérifie si c'est une commande ---
        if (!messageBody.startsWith(prefix)) continue
        if (!(publicMode || message.key.fromMe ||
            approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
            lid.includes(message.key.participant || message.key.remoteJid))) continue

        const commandAndArgs = messageBody.slice(prefix.length).trim()
        const parts = commandAndArgs.split(/\s+/)
        const command = parts[0]

        // --- Switch pour toutes les commandes ---
        switch (command) {
            case 'uptime':
                await safeCommand(client, message, async () => { await react(client, message); await uptime(client, message) })
                break
            case 'ping':
                await safeCommand(client, message, async () => { await react(client, message); await pingTest(client, message) })
                break
            case 'menu':
                await safeCommand(client, message, async () => { await react(client, message); await info(client, message) })
                break
            case 'fancy':
                await safeCommand(client, message, async () => { await react(client, message); await fancy(client, message) })
                break
            case 'setpp':
                await safeCommand(client, message, async () => { await react(client, message); await pp.setpp(client, message) })
                break
            case 'getpp':
                await safeCommand(client, message, async () => { await react(client, message); await pp.getpp(client, message) })
                break
            case 'sudo':
                await safeCommand(client, message, async () => { await react(client, message); await sudo.sudo(client, message, approvedUsers); configmanager.save() })
                break
            case 'delsudo':
                await safeCommand(client, message, async () => { await react(client, message); await sudo.delsudo(client, message, approvedUsers); configmanager.save() })
                break
            case 'public':
                await safeCommand(client, message, async () => { await react(client, message); await set.isPublic(message, client) })
                break
            case 'setprefix':
                await safeCommand(client, message, async () => { await react(client, message); await set.setprefix(message, client) })
                break
            case 'autotype':
                await safeCommand(client, message, async () => { await react(client, message); await set.setautotype(message, client) })
                break
            case 'autorecord':
                await safeCommand(client, message, async () => { await react(client, message); await set.setautorecord(message, client) })
                break
            case 'welcome':
                await safeCommand(client, message, async () => { await react(client, message); await set.setwelcome(message, client) })
                break
            case 'photo':
                await safeCommand(client, message, async () => { await react(client, message); await media.photo(client, message) })
                break
            case 'toaudio':
                await safeCommand(client, message, async () => { await react(client, message); await media.tomp3(client, message) })
                break
            case 'sticker':
                await safeCommand(client, message, async () => { await react(client, message); await sticker(client, message) })
                break
            case 'play':
                await safeCommand(client, message, async () => { await react(client, message); await play(message, client) })
                break
            case 'img':
                await safeCommand(client, message, async () => { await react(client, message); await img(message, client) })
                break
            case 'vv':
                await safeCommand(client, message, async () => { await react(client, message); await viewonce(client, message) })
                break
            case 'save':
                await safeCommand(client, message, async () => { await react(client, message); await save(client, message) })
                break
            case 'tiktok':
                await safeCommand(client, message, async () => { await react(client, message); await tiktok(client, message) })
                break
            case 'url':
                await safeCommand(client, message, async () => { await react(client, message); await url(client, message) })
                break
            case 'tag':
                await safeCommand(client, message, async () => { await react(client, message); await tag.tag(client, message) })
                break
            case 'tagall':
                await safeCommand(client, message, async () => { await react(client, message); await tag.tagall(client, message) })
                break
            case 'tagadmin':
                await safeCommand(client, message, async () => { await react(client, message); await tag.tagadmin(client, message) })
                break
            case 'kick':
                await safeCommand(client, message, async () => { await react(client, message); await group.kick(client, message) })
                break
            case 'kickall':
                await safeCommand(client, message, async () => { await react(client, message); await group.kickall(client, message) })
                break
            case 'promote':
                await safeCommand(client, message, async () => { await react(client, message); await group.promote(client, message) })
                break
            case 'demote':
                await safeCommand(client, message, async () => { await react(client, message); await group.demote(client, message) })
                break
            case 'mute':
                await safeCommand(client, message, async () => { await react(client, message); await group.mute(client, message) })
                break
            case 'unmute':
                await safeCommand(client, message, async () => { await react(client, message); await group.unmute(client, message) })
                break
            case 'gclink':
                await safeCommand(client, message, async () => { await react(client, message); await group.gclink(client, message) })
                break
            case 'antilink':
                await safeCommand(client, message, async () => { await react(client, message); await group.antilink(client, message) })
                break
            case 'antimentiongc':
                await safeCommand(client, message, async () => {
                    await react(client, message)
                    const arg = parts[1]?.toLowerCase()
                    const groupConf = configmanager.config.groups[remoteJid] || {}
                    groupConf.antimentiongc ??= { delete: false, kick: false, on: false }

                    switch(arg) {
                        case 'delete':
                            groupConf.antimentiongc.delete = !groupConf.antimentiongc.delete
                            break
                        case 'kick':
                            groupConf.antimentiongc.kick = !groupConf.antimentiongc.kick
                            break
                        case 'on':
                            groupConf.antimentiongc.on = !groupConf.antimentiongc.on
                            break
                    }
                    configmanager.config.groups[remoteJid] = groupConf
                    configmanager.save()
                    await client.sendMessage(remoteJid, { text: `✅ Anti-mention GC mis à jour : ${JSON.stringify(groupConf.antimentiongc)}` })
                })
                break
            case 'test':
                await safeCommand(client, message, async () => { await react(client, message) })
                break
        }
    }
}

export default handleIncomingMessage