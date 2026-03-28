/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Helper Utilities
 * Specialized for Bot Performance & Efficiency
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/**
 * Télécharger un média depuis un message
 * Optimisé pour la gestion des flux (streams)
 */
const downloadMedia = async (message) => {
  try {
    const messageType = Object.keys(message)[0];
    const type = messageType.replace('Message', '');
    const stream = await downloadContentFromMessage(message[messageType], type);
    
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (error) {
    throw new Error(`[UTILS ERROR]: Téléchargement média échoué`);
  }
};

/**
 * Formatage de la taille de fichier (Gras Premium)
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `*${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}*`;
};

/**
 * Système d'upload temporaire (Catbox ou File.io)
 * Catbox est souvent plus stable pour les fichiers plus gros
 */
const uploadFile = async (buffer) => {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('fileToUpload', buffer, { filename: 'ghostgx_file' });
    form.append('reqtype', 'fileupload');
    
    // Utilisation de Catbox pour une meilleure persistance
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });
    return res.data; 
  } catch (error) {
    throw new Error('[UTILS ERROR]: Upload de fichier échoué');
  }
};

/**
 * Temps de fonctionnement du Bot (Format Prestige)
 */
const runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  
  let res = '';
  if (d > 0) res += `*${d}ᴅ* `;
  if (h > 0) res += `*${h}ʜ* `;
  if (m > 0) res += `*${m}ᴍ* `;
  res += `*${s}s*`;
  return res.trim();
};

/**
 * Autres utilitaires rapides
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseMentions = (text) => {
  const mentions = [];
  const regex = /@(\d+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1] + '@s.whatsapp.net');
  }
  return mentions;
};

const extractUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex)?.[0] || null;
};

module.exports = {
  downloadMedia,
  formatSize,
  sleep,
  parseMentions,
  uploadFile,
  extractUrl,
  runtime,
  random: (arr) => arr[Math.floor(Math.random() * arr.length)],
  isUrl: (t) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(t)
};
