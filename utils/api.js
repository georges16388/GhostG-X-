/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - API Integration Utilities
 * Optimized for Prestige Edition V5.3 (Fixed YouTube Video Mismatch)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

const api = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

const tryRequest = async (getter, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await getter();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastError;
};

const APIs = {
   // Remplace tes fonctions YouTube existantes dans APIs.js par celles-ci :

  getEliteProTechVideoByUrl: async (url) => {
    try {
      const res = await api.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
      // L'API Siputzx renvoie souvent l'URL dans data.dl ou data.url
      const dl = res.data?.data?.dl || res.data?.data?.url;
      if (dl) return { download: dl };
      throw new Error('Elite Source down');
    } catch (e) { throw e; }
  },

  getYupraVideoByUrl: async (url) => {
    try {
      const res = await api.get(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
      if (res.data?.success && res.data.data?.download_url) {
        return { download: res.data.data.download_url };
      }
      throw new Error('Yupra Source down');
    } catch (e) { throw e; }
  },

  getOkatsuVideoByUrl: async (url) => {
    try {
      const res = await api.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
      if (res.data?.url || res.data?.result?.url) {
        return { download: res.data.url || res.data.result.url };
      }
      throw new Error('Okatsu Source down');
    } catch (e) { throw e; }
  },

  // --- AI & CHAT ---
  generateImage: async (prompt) => {
    try {
      const res = await api.get(`https://api.siputzx.my.id/api/ai/stablediffusion`, { params: { prompt } });
      return res.data;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec génération image'); }
  },

  chatAI: async (text) => {
    try {
      const res = await api.get(`https://api.shizo.top/ai/gpt?apikey=shizo&query=${encodeURIComponent(text)}`);
      return res.data?.msg ? { msg: res.data.msg } : res.data;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec réponse AI'); }
  },

  // --- YOUTUBE AUDIO ---
  getIzumiDownloadByUrl: async (url) => {
    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`;
    const res = await tryRequest(() => axios.get(apiUrl));
    if (res.data?.result?.download) return res.data.result;
    throw new Error('Source Izumi indisponible');
  },

  getYupraDownloadByUrl: async (url) => {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await tryRequest(() => axios.get(apiUrl));
    if (res.data?.success) return { download: res.data.data.download_url, title: res.data.data.title };
    throw new Error('Source Yupra indisponible');
  },

  // --- SOCIAL MEDIA DOWNLOADERS ---
  tiktokDownload: async (url) => {
    try {
      const res = await api.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`);
      const d = res.data.data;
      const videoUrl = d.urls?.[0] || d.video_url || d.url || d.download_url;
      return { videoUrl, title: d.metadata?.title || 'TikTok Video' };
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec TikTok'); }
  },

  igDownload: async (url) => {
    try {
      const res = await api.get(`https://api.siputzx.my.id/api/d/igdl`, { params: { url } });
      return res.data;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec Instagram'); }
  },

  // --- TOOLS & UTILS ---
  translate: async (text, to = 'fr') => {
    try {
      const res = await api.get(`https://api.siputzx.my.id/api/tools/translate`, { params: { text, to } });
      return res.data;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec traduction'); }
  },

  textToSpeech: async (text) => {
    try {
      const res = await api.get(`https://www.laurine.site/api/tts/tts-nova?text=${encodeURIComponent(text)}`);
      let url = res.data?.data?.URL || res.data?.data?.url || res.data?.url || res.data;
      if (res.data?.data?.MP3) url = `https://ttsmp3.com/created_mp3_ai/${res.data.data.MP3}`;
      return url;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec TTS'); }
  },

  screenshotWebsite: async (url) => {
    try {
      const apiUrl = `https://eliteprotech-apis.zone.id/ssweb?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      return Buffer.from(res.data);
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec Screenshot'); }
  },

  shortenUrl: async (url) => {
    try {
      const res = await api.get(`https://tinyurl.com/api-create.php`, { params: { url } });
      return res.data;
    } catch (e) { throw new Error('ɢʜᴏsᴛɢ-x : Échec Shorten'); }
  }
};

module.exports = APIs;
