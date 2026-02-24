import send from "../utils/sendMessage.js";
import configmanager from '../utils/configmanager.js';

/** Tag tous les membres du groupe */
export async function tagall(client, message) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) return;

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(user => user.id);
        const text = participants.map(u => `@${u.split('@')[0]}`).join(' \n');

        await send(message, client, 
`╭─⌈ 🚀 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ Broadcast ⌋
│
${text}
│
╰─⌊ Powered by -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗 ⌉`, participants);
    } catch (error) {
        console.error("Tagall error:", error);
    }
}

/** Tag tous les admins sauf le bot */
export async function tagadmin(client, message) {
    const remoteJid = message.key.remoteJid;
    const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!remoteJid.includes('@g.us')) return;

    try {
        const { participants } = await client.groupMetadata(remoteJid);
        const admins = participants.filter(p => p.admin && p.id !== botNumber).map(p => p.id);
        if (!admins.length) return;

        const text = `╭─⌈ 🛡️ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ Alert ⌋
│ Admin Alert
│
${admins.map(u => `@${u.split('@')[0]}`).join('\n')}
│
╰─⌊ MR-SAYAN Control ⌉`;

        await send(message, client, text, admins);
    } catch (error) {
        console.error("Tagadmin error:", error);
    }
}

/** Réponse automatique avec audio si mentionné */
export async function respond(client, message) {
    const number = client.user.id.split(':')[0];
    if (!configmanager.config.users[number]) return;

    const tagRespond = configmanager.config.users[number].response;
    if (!message.key.fromMe && tagRespond) {
        const lid = client.user?.lid?.split(':')[0] || number;
        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        if (messageBody.includes(`@${lid}`)) {
            await client.sendMessage(message.key.remoteJid, {
                audio: { url: "database/DigiX.mp3" },
                mimetype: "audio/mp4",
                ptt: true,
                contextInfo: {
                    stanzaId: message.key.id,
                    participant: message.key.participant || lid,
                    quotedMessage: message.message
                }
            });
        }
    }
}

/** Tag personnalisé ou reply */
export async function tag(client, message) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) return;

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);

        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
        const text = args.join(' ') || 'Ghost G X Alert';

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            if (quotedMessage.stickerMessage) {
                await send(message, client, null, participants, quotedMessage.stickerMessage);
            } else {
                const quotedText = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || text;
                await send(message, client, quotedText, participants);
            }
            return;
        }

        await send(message, client, text, participants);
    } catch (error) {
        console.error("Tag error:", error);
    }
}

export default { tagall, tagadmin, respond, tag };