/**
 * GPT Image Command - Vision & Edit
 * Full Logic by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');
const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');
const config = require('../../config');

const VISION_DESIGN = (prompt) => `╭╼━≪• ɢʜᴏꜱᴛ ᴠɪꜱɪᴏɴ •≫━╾╮
┃ 
┃ ᴘʀᴏᴍᴘᴛ : ${prompt}
┃ ꜱᴛᴀᴛᴜꜱ : ᴘʀᴏᴄᴇꜱꜱᴇᴅ ✨
┃ ᴛʏᴘᴇ : ᴀɪ ᴀɴᴀʟʏꜱɪꜱ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`;

module.exports = {
  name: 'gptimage',
  aliases: ['gptimg', 'vision', 'gi'],
  category: 'ai',
  description: 'Analyse ou modifie une image via l\'IA.',
  usage: '.gi <prompt> (en répondant à une image)',

  async execute(sock, msg, args, extra) {
    try {
      const { from, quoted, prefix } = extra;
      const prompt = args.join(' ').trim();

      if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
        return extra.reply(`⚠️ *Répondez à une image ou un sticker !*\nEx: ${prefix}gi décrit cette image`);
      }

      if (!prompt) return extra.reply("❌ *Veuillez préciser ce que l'IA doit faire !*");

      await sock.sendMessage(from, { react: { text: "👁️", key: msg.key } });

      // Téléchargement du média
      const mediaBuffer = await downloadMediaMessage(
        { key: msg.message.extendedTextMessage.contextInfo.quotedMessage ? { remoteJid: from, id: msg.message.extendedTextMessage.contextInfo.stanzaId } : msg.key, 
          message: quoted },
        'buffer'
      );

      let imageBuffer = mediaBuffer;
      
      // Conversion sticker -> png si nécessaire
      if (quoted.stickerMessage) {
        imageBuffer = await webp2png(mediaBuffer);
      }

      // Optimisation de l'image pour l'API (Sharp)
      const finalImageBuffer = await sharp(imageBuffer)
        .resize(800) // Redimensionner pour économiser de la bande passante
        .jpeg({ quality: 80 })
        .toBuffer();

      // Envoi à l'API (Exemple avec une API de type GPT-4 Vision)
      // Note: Tu dois avoir une clé API valide dans ton config.js
      const base64Image = finalImageBuffer.toString('base64');
      
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 500
        }, {
          headers: { 'Authorization': `Bearer ${config.apiKeys.openai}` }
        });

        const result = response.data.choices[0].message.content;

        await sock.sendMessage(from, { 
          text: VISION_DESIGN(prompt) + `\n\n${result}`,
          mentions: [extra.sender]
        }, { quoted: msg });

      } catch (apiErr) {
        console.error("API AI Error:", apiErr.message);
        await extra.reply("❌ *L'IA n'a pas pu répondre.* Vérifie ta clé API OpenAI.");
      }

    } catch (error) {
      console.error("Global GI Error:", error);
      await extra.reply("❌ *Une erreur est survenue lors du traitement !*");
    }
  }
};
