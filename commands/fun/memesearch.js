/**
 * Meme Search Command - Search and get memes
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

const BASE = 'https://api.shizo.top/tools/meme-search';

// Design pour la légende du Meme recherché
const MEME_SEARCH_DESIGN = (query) => `╭╼━≪• ɢʜᴏsᴛ ᴍᴇᴍᴇ sᴇᴀʀᴄʜ •≫━╾╮
┃ sᴇᴀʀᴄʜ : ${query} 🔍
┃ sᴛᴀᴛᴜs : ғᴏᴜɴᴅ ✨
┃ ᴛʏᴘᴇ : ᴅʏɴᴀᴍɪᴄ ᴍᴇᴅɪᴀ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'memesearch',
  aliases: ['memes', 'sm', 'smeme', 'gifsearch', 'gif'],
  category: 'fun',
  desc: 'Search and get memes',
  usage: 'memesearch <query>',
  execute: async (sock, msg, args, extra) => {
    try {
      const query = args.join(' ').trim();
      const prefix = extra.prefix || '.';
      
      if (!query) {
        return await extra.reply(
          `╭╼━≪• ᴍᴇᴍᴇ sᴇᴀʀᴄʜ •≫━╾╮\n` +
          `┃ ᴜsᴀɢᴇ : ${prefix}ɢɪғ <ǫᴜᴇʀʏ>\n` +
          `┃ ᴇx : ${prefix}ɢɪғ ʜᴇʟʟᴏ\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }

      // Réaction de recherche
      await sock.sendMessage(extra.from, { react: { text: "🔍", key: msg.key } });
      
      const url = `${BASE}?apikey=shizo&query=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const mediaBuffer = Buffer.from(response.data);
      if (!mediaBuffer || mediaBuffer.length === 0) throw new Error('Empty response');
      
      const maxVideoSize = 16 * 1024 * 1024;
      const maxImageSize = 5 * 1024 * 1024;
      const contentType = response.headers['content-type'] || '';
      const fileHeader = mediaBuffer.slice(0, 6).toString('ascii');
      const isGIF = fileHeader === 'GIF89a' || fileHeader === 'GIF87a' || contentType.includes('gif');
      
      const caption = MEME_SEARCH_DESIGN(query);

      if (isGIF) {
        if (mediaBuffer.length > maxVideoSize) throw new Error('GIF too large');
        
        const tempDir = getTempDir();
        const timestamp = Date.now();
        const gifPath = path.join(tempDir, `meme_gif_${timestamp}.gif`);
        const mp4Path = path.join(tempDir, `meme_mp4_${timestamp}.mp4`);
        
        try {
          fs.writeFileSync(gifPath, mediaBuffer);
          
          const ffmpegCmd = `"${ffmpegPath}" -i "${gifPath}" -vf "fps=15,scale=512:-1:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -y "${mp4Path}"`;
          
          await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (error) => error ? reject(error) : resolve());
          });
          
          await sock.sendMessage(extra.from, {
            video: fs.readFileSync(mp4Path),
            mimetype: 'video/mp4',
            gifPlayback: true,
            caption: caption
          }, { quoted: msg });
          
        } catch (convertError) {
          // Fallback GIF
          await sock.sendMessage(extra.from, {
            document: mediaBuffer,
            mimetype: 'image/gif',
            fileName: `ghost_meme.gif`,
            caption: caption
          }, { quoted: msg });
        } finally {
          deleteTempFile(gifPath);
          deleteTempFile(mp4Path);
        }
      } else if (contentType.includes('video') || contentType.includes('mp4')) {
        await sock.sendMessage(extra.from, {
          video: mediaBuffer,
          mimetype: 'video/mp4',
          caption: caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          image: mediaBuffer,
          caption: caption
        }, { quoted: msg });
      }

      // Réaction de succès
      await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });
      
    } catch (error) {
      console.error('MemeSearch Error:', error);
      await extra.reply(`❌ Failed to fetch meme: ${error.message}`);
    }
  }
};
