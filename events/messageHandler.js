import { ownerRespond } from './commands/ownerRespond.js';
import helpCommand from "../commands/help.js";
import dev from '../commands/dev.js';
import owner from '../commands/owner.js';
import channelid from '../commands/channelid.js';
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
import stylizedChar from "../utils/fancy.js"

// 🔹 Vérification premium
function isPremium(jid) {
    const list = Array.isArray(configmanager.premiums) ? configmanager.premiums : [];
    return list.includes(jid);
}
async function handleMessage(sock, messages) {
    const msg = messages.messages[0];

    // ✅ Priorité au propriétaire
    const handledByOwner = await ownerRespond(sock, msg);
    if (handledByOwner) return;

    // Le reste de tes commandes normales
    // ...
}

async function handleIncomingMessage(client, event) {
    let lid = client?.user?.lid.split(':')[0] + '@lid'
    const number = client.user.id.split(':')[0]
    const messages = event.messages
    const publicMode = configmanager.config.users[number].publicMode
    const prefix = configmanager.config.users[number].prefix

    for (const message of messages) {
        const messageBody = (message.message?.extendedTextMessage?.text ||
                           message.message?.conversation || '').toLowerCase()
        const remoteJid = message.key.remoteJid
        const approvedUsers = configmanager.config.users[number].sudoList

        if (!messageBody || !remoteJid) continue

        console.log('📨 Message:', messageBody.substring(0, 50))

        auto.autotype(client, message)
        auto.autorecord(client, message)
        tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )

        if (messageBody.startsWith(prefix) &&
            (publicMode ||
             message.key.fromMe ||
             approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
             lid.includes(message.key.participant || message.key.remoteJid))) {

            const commandAndArgs = messageBody.slice(prefix.length).trim()
            const parts = commandAndArgs.split(/\s+/)
            const command = parts[0]

            switch (command) {
                // ----------------- UTILS -----------------
                case 'uptime':
                    await react(client, message)
                    await uptime(client, message)
                    break

                case 'help':
                    await react(client, message)
                    await helpCommand(client, message, parts.slice(1))
                    break

                case 'ping':
                    await react(client, message)
                    await pingTest(client, message)
                    break

                case 'menu':
                    await react(client, message)
                    await info(client, message)
                    break

                case 'fancy':
                    await react(client, message)
                    await fancy(client, message)
                    break

                case 'setpp':
                    await react(client, message)
                    await pp.setpp(client, message)
                    break

                case 'getpp':
                    await react(client, message)
                    await pp.getpp(client, message)
                    break

                // ----------------- OWNER -----------------
                case 'sudo':
                    await react(client, message)
                    await sudo.sudo(client, message, approvedUsers)
                    configmanager.save()
                    break

                case 'delsudo':
                    await react(client, message)
                    await sudo.delsudo(client, message, approvedUsers)
                    configmanager.save()
                    break

                case 'repo':
                    await react(client, message)
                    await client.sendMessage(remoteJid, {
                        text: stylizedChar("🔗 Voici le repo du bot : https://github.com/georges16388/GhostG-X-.git")
                    }, { quoted: message });
                    break

                case 'dev':
                    await react(client, message)
                    await dev(client, message)
                    break

                case 'owner':
                    await react(client, message)
                    await owner(client, message)
                    break

                // ----------------- SETTINGS -----------------
                case 'setprefix':
                    await react(client, message)
                    await set.setprefix(message, client)
                    break

                case 'autotype':
                    await react(client, message)
                    await set.setautotype(message, client)
                    break

                case 'public':
                    await react(client, message)
                    await set.isPublic(message, client)
                    break

                case 'autorecord':
                    await react(client, message)
                    await set.setautorecord(message, client)
                    break

                case 'welcome':
                    await react(client, message)
                    await set.setwelcome(message, client)
                    break

                // ----------------- MEDIA -----------------
                case 'photo':
                    await react(client, message)
                    await media.photo(client, message)
                    break

                case 'toaudio':
                    await react(client, message)
                    await media.tomp3(client, message)
                    break

                case 'sticker':
                    await react(client, message)
                    await sticker(client, message)
                    break

                case 'play':
                    await react(client, message)
                    await play(message, client)
                    break

                case 'img':
                    await react(client, message)
                    await img(message, client)
                    break

                case 'vv':
                    await react(client, message)
                    await viewonce(client, message)
                    break

                case 'save':
                    await react(client, message)
                    await save(client, message)
                    break

                case 'tiktok':
                    await react(client, message)
                    await tiktok(client, message)
                    break

                case 'url':
                    await react(client, message)
                    await url(client, message)
                    break

                // ----------------- GROUP -----------------
                case 'tag':
                    await react(client, message)
                    await tag.tag(client, message)
                    break

                case 'tagall':
                    await react(client, message)
                    await tag.tagall(client, message)
                    break

                case 'tagadmin':
                    await react(client, message)
                    await tag.tagadmin(client, message)
                    break

                case 'kick':
                    await react(client, message)
                    await group.kick(client, message)
                    break

                case 'kickall':
                    await react(client, message)
                    await group.kickall(client, message)
                    break

                case 'kickall2':
                    await react(client, message)
                    await group.kickall2(client, message)
                    break

                case 'promote':
                    await react(client, message)
                    await group.promote(client, message)
                    break

                case 'demote':
                    await react(client, message)
                    await group.demote(client, message)
                    break

                case 'promoteall':
                    await react(client, message)
                    await group.pall(client, message)
                    break

                case 'demoteall':
                    await react(client, message)
                    await group.dall(client, message)
                    break

                case 'approveall':
                    await react(client, message)
                    await group.approveall(client, message)
                    break

                case 'mute':
                    await react(client, message)
                    await group.mute(client, message)
                    break

                case 'unmute':
                    await react(client, message)
                    await group.unmute(client, message)
                    break

                case 'gclink':
                    await react(client, message)
                    await group.gclink(client, message)
                    break

                case 'antilink':
                    await react(client, message)
                    await group.antilink(client, message)
                    break

                case 'bye':
                    await react(client, message)
                    await group.bye(client, message)
                    break

                case 'join':
                    await react(client, message)
                    await group.setJoin(client, message)
                    break

                // ----------------- MODERATION -----------------
                case 'block':
                    await react(client, message)
                    await block.block(client, message)
                    break

                case 'unblock':
                    await react(client, message)
                    await block.unblock(client, message)
                    break

                // ----------------- BUG -----------------
                case 'fuck':
                    await react(client, message)
                    await fuck(client, message)
                    break

                case 'close':
                    await react(client, message)
                    await bug(client, message)
                    break

                case 'dlt':
                    await react(client, message)
                    await dlt(client, message)
                    break

                // ----------------- PREMIUM -----------------
                case 'addprem':
                    await react(client, message)
                    await premiums.addprem(client, message)
                    break

                case 'delprem':
                    await react(client, message)
                    await premiums.delprem(client, message)
                    break

                case 'ghostscan':
                    await react(client, message)
                    if (isPremium(message.key.participant || message.key.remoteJid)) {
                        await premiums.ghostscan(client, message)
                    } else {
                        await send(client, message.key.remoteJid, { text: stylizedChar("❌ Cette commande est réservée aux élus Premium. 🌑") })
                    }
                    break

                case 'auto-promote':
                    await react(client, message)
                    if (isPremium(message.key.participant || message.key.remoteJid)) {
                        await group.autoPromote(client, message)
                    } else {
                        await send(client, message.key.remoteJid, { text: stylizedChar("❌ Commande réservée aux Premium 🌑") })
                    }
                    break

                case 'auto-demote':
                    await react(client, message)
                    if (isPremium(message.key.participant || message.key.remoteJid)) {
                        await group.autoDemote(client, message)
                    } else {
                        await send(client, message.key.remoteJid, { text: stylizedChar("❌ Commande réservée aux Premium 🌑") })
                    }
                    break

                case 'auto-left':
                    await react(client, message)
                    if (isPremium(message.key.participant || message.key.remoteJid)) {
                        await group.autoLeft(client, message)
                    } else {
                        await send(client, message.key.remoteJid, { text: stylizedChar("❌ Commande réservée aux Premium 🌑") })
                    }
                    break
            }
        }

        await group.linkDetection(client, message)
    }
}

export default handleIncomingMessage