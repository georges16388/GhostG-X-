import send from "../utils/sendMessage.js";
import pkg from 'wa-sticker-formatter';
const { Sticker, StickerTypes } = pkg;
import { downloadMediaMessage } from "baileys";
import fs from "fs";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

export async function sticker(client, message) {
    let tempInput, tempOutput;

    try {
        const remoteJid = message.key.remoteJid;
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const username = message.pushName || "Inconnu";

        if (!quotedMessage) {
            return send(message, client, "❌ Respond to an image or video to convert it into a sticker!");
        }

        const isVideo = !!quotedMessage.videoMessage;
        const isImage = !!quotedMessage.imageMessage;

        if (!isVideo && !isImage) {
            return send(message, client, "❌ The quoted message is not an image or a video!");
        }

        const mediaBuffer = await downloadMediaMessage({ message: quotedMessage, client }, "buffer");
        if (!mediaBuffer) return send(message, client, "❌ Media download failed!");

        const uniqueId = Date.now();
        tempInput = isVideo ? `./temp_video_${uniqueId}.mp4` : `./temp_image_${uniqueId}.jpg`;
        tempOutput = `./temp_sticker_${uniqueId}.webp`;

        fs.writeFileSync(tempInput, mediaBuffer);

        if (isVideo) {
            await new Promise((resolve, reject) => {
                ffmpeg(tempInput)
                    .output(tempOutput)
                    .outputOptions([
                        "-vf scale=512:512:flags=lanczos",
                        "-c:v libwebp",
                        "-q:v 50",
                        "-preset default",
                        "-loop 0",
                        "-an",
                        "-vsync 0"
                    ])
                    .on("end", resolve)
                    .on("error", reject)
                    .run();
            });
        } else {
            await sharp(tempInput)
                .resize(512, 512, { fit: "inside" })
                .webp({ quality: 80 })
                .toFile(tempOutput);
        }

        const stickerObj = new Sticker(tempOutput, {
            pack: `-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗`,
            author: `-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ`,
            type: isVideo ? StickerTypes.FULL : StickerTypes.DEFAULT,
            quality: 80,
            animated: isVideo,
        });

        const stickerMessage = await stickerObj.toMessage();
        await client.sendMessage(remoteJid, stickerMessage); // stickers doivent être envoyés par client directement

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        await send(message, client, `⚠️ Error converting media to sticker: ${errorMsg}`);
    } finally {
        if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
}

export default sticker;