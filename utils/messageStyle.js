import fs from "fs";
import stylizedChar from "./fancy.js";

// Liste des images et MP3
const images = ["GhostG-X.jpg", "GhostG-X7.jpg", "menu.jpg"];
const audio = "GhostG-X.mp3";

export default function stylizedCardMessage(text) {
  // Choisir une image aléatoire
  const randomImage = images[Math.floor(Math.random() * images.length)];

  return {
    text: stylizedChar(text),
    contextInfo: {
      externalAdReply: {
        title: "⏤͟͟͞ＧＨＯＳＴＧ－Ｘ",
        body: "⏤͟͟͞ＧＨＯＳＴＧ",
        thumbnail: fs.readFileSync(`./database/${randomImage}`), // miniature aléatoire
        mediaType: 1, // 1 = lien / media
        renderLargerThumbnail: false,
        sourceUrl: `database/${audio}`, // MP3 cliquable
        mediaUrl: `database/${audio}`
      }
    }
  };
}