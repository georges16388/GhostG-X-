import send from "../utils/sendMessage.js";
import fs from "fs";
import { downloadMediaMessage } from "baileys";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function photo(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const sticker = quoted?.stickerMessage;

        if (!sticker) {
            return await send(sock, message.key.remoteJid, {
                text: '📸 *-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ*\n\nRépondez à un sticker pour le convertir en image.\n\nUsage: .photo (réponse à un sticker)'
            });
        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer");
        if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

        const filename = `./temp/sticker-${Date.now()}.png`;
        fs.writeFileSync(filename, buffer);

        await send(sock, message.key.remoteJid, {
            image: fs.readFileSync(filename),
            caption: '🔥 -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗 226'
        });

        fs.unlinkSync(filename);

    } catch (error) {
        console.error("PHOTO ERROR:", error);
        await send(sock, message.key.remoteJid, { text: '❌ Erreur de conversion.' });
    }
}

export async function tomp3(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const video = quoted?.videoMessage;

        if (!video) {
            return await send(sock, message.key.remoteJid, {
                text: '🎵 *-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ*\n\nRépondez à une vidéo pour extraire l\'audio.\n\nUsage: .toaudio (réponse à une vidéo)'
            });
        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer");
        if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

        const inputPath = `./temp/video-${Date.now()}.mp4`;
        const outputPath = `./temp/audio-${Date.now()}.mp3`;
        fs.writeFileSync(inputPath, buffer);

        await execAsync(`ffmpeg -i "${inputPath}" -vn -ab 128k -ar 44100 -y "${outputPath}"`);

        await send(sock, message.key.remoteJid, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mp4',
            ptt: false
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error("TOMP3 ERROR:", error);
        await send(sock, message.key.remoteJid, { text: '❌ Erreur de conversion audio.' });
    }
}

export default { photo, tomp3 };