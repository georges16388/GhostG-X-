import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";

export async function sender(message, client, text) {
    const remoteJid = message?.key?.remoteJid;
    if (!remoteJid) return;

    try {
        await send(client, remoteJid, { text: stylizedChar(`> _*${text}*_`) });
    } catch (err) {
        console.error('SENDER ERROR:', err);
    }
}

export default sender;