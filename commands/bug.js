import send from "../utils/sendMessage.js";
async function bug(message, client, texts, num) {

    try {
        
            const remoteJid = message.key?.remoteJid;

            await client.sendMessage(remoteJid, {

                image: { url: `database/${num}.jpg` },

                caption: `> ${texts}`,

                contextInfo: {

                    externalAdReply: {

                        title: "Join Our WhatsApp Channel",

                        body: " -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",

                        mediaType: 1, // Image preview

                        thumbnailUrl: `https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c`,

                        renderLargerThumbnail: false,

                        mediaUrl: `${num}.jpg`,

                        sourceUrl: `${num}.jpg`
                    }
                }
            });

    } catch (e) {
     console.log(e)

    }
}




            /*const remoteJid = message.key.remoteJid;

            await client.sendMessage(remoteJid, {

                image: { url: `${num}.jpg` },

                caption: `> ${texts}`,

                contextInfo: {

                    externalAdReply: {

                        title: "Join Our WhatsApp Channel",

                        body: "GhostG-X dev🔥",

                        mediaType: 1, // Image preview

                        thumbnailUrl: `https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c`,

                        renderLargerThumbnail: false,

                        mediaUrl: `${num}.jpg`,

                        sourceUrl: `${num}.jpg`
                    }
                }
            });
        }
        */
        export default bug;
