import fs from "fs"
import stylizedChar from "./fancy.js"

export default function stylizedCardMessage(text) {
  return {
    text: stylizedChar(text),
    contextInfo: {
      externalAdReply: {
        title: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
        body: "𓆩GhostG-X𓆪",
        thumbnail: fs.readFileSync("./database/DigiX.jpg"),
        sourceUrl: "https://whatsapp.com",
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }
}

