/**
 * JID & LID Identity Linker - AGM Identity-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { jidDecode, jidEncode } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// --- CACHE DYNAMIQUE AGM ---
const lidCache = new Map();

/**
 * Récupère la correspondance LID <-> PN depuis le stockage session
 */
const getLidMapping = (user, type) => {
  if (!user) return null;
  const key = `${type}:${user}`;
  if (lidCache.has(key)) return lidCache.get(key);
  
  const sessionPath = path.join(__dirname, '..', config.sessionName || 'session');
  const file = type === 'pnToLid' ? `${user}.json` : `${user}_reverse.json`;
  const filePath = path.join(sessionPath, `lid-mapping-${file}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      lidCache.set(key, null);
      return null;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
    lidCache.set(key, data);
    return data;
  } catch (e) {
    return null;
  }
};

/**
 * Normalise un JID en tenant compte des identifiants liés
 */
const normalizeJid = (jid) => {
  if (!jid) return jid;
  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return jid.split('@')[0] + '@s.whatsapp.net';
    
    let user = decoded.user;
    const isLid = decoded.server === 'lid' || decoded.server === 'hosted.lid';
    
    if (isLid) {
        const pn = getLidMapping(user, 'lidToPn');
        if (pn) user = pn;
    }
    
    return jidEncode(user, 's.whatsapp.net');
  } catch (e) {
    return jid;
  }
};

/**
 * Construit une liste d'IDs comparables (PN + LID)
 */
const getComparableIds = (jid) => {
  if (!jid) return [];
  const ids = new Set();
  try {
    const { user, server } = jidDecode(jid);
    const cleanServer = server === 'c.us' ? 's.whatsapp.net' : server;
    
    ids.add(jidEncode(user, cleanServer));
    
    // Tentative de mapping PN -> LID
    if (cleanServer === 's.whatsapp.net') {
      const lid = getLidMapping(user, 'pnToLid');
      if (lid) ids.add(jidEncode(lid, 'lid'));
    } 
    // Tentative de mapping LID -> PN
    else if (cleanServer === 'lid') {
      const pn = getLidMapping(user, 'lidToPn');
      if (pn) ids.add(jidEncode(pn, 's.whatsapp.net'));
    }
    
    return Array.from(ids);
  } catch (e) {
    return [jid];
  }
};

/**
 * Trouve un participant dans une liste en vérifiant PN et LID
 */
const findParticipant = (participants = [], targetId) => {
  const targets = getComparableIds(targetId);
  return participants.find(p => {
    if (!p) return false;
    const pIds = [p.id, p.lid, p.userJid].filter(Boolean).flatMap(id => getComparableIds(id));
    return pIds.some(id => targets.includes(id));
  }) || null;
};

module.exports = {
  findParticipant,
  getComparableIds,
  normalizeJid,
  getLidMapping
};
