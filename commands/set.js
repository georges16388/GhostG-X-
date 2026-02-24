import send from "../utils/sendMessage.js";
import _0xcfg from '../utils/configmanager.js';
import _0xbug from '../commands/bug.js';

function _0xemoji(_0x1){const _0xreg=/^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;return _0xreg.test(_0x1);}

export async function _0xsetPrefix(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xjid=_0xmsg.key?.remoteJid;
        if(!_0xjid)throw new Error("Message JID is undefined.");
        const _0xtext=_0xmsg.message?.extendedTextMessage?.text||_0xmsg.message?.conversation||'';
        const _0xargs=_0xtext.slice(1).trim().split(/\s+/).slice(1);
        const _0xpre=_0xargs[0]||'';
        if(!_0xcfg.config.users[_0xid])_0xcfg.config.users[_0xid]={};
        _0xcfg.config.users[_0xid].prefix=_0xpre;
        _0xcfg.save();
        await _0xbug(_0xmsg,_0xclient,_0xpre?'Prefix changed ✅':'Prefix cleared 🚀',3);
    }catch(_0xerr){await _0xclient.sendMessage(_0xmsg.key.remoteJid,{text:'❌ Error changing prefix: '+_0xerr.message});}
}

export async function _0xsetReaction(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xjid=_0xmsg.key?.remoteJid;
        if(!_0xjid)throw new Error("Message JID is undefined.");
        const _0xtext=_0xmsg.message?.extendedTextMessage?.text||_0xmsg.message?.conversation||'';
        const _0xargs=_0xtext.slice(1).trim().split(/\s+/).slice(1);
        if(!_0xargs[0]||!_0xemoji(_0xargs[0]))throw new Error("Specify a valid emoji.");
        if(!_0xcfg.config.users[_0xid])_0xcfg.config.users[_0xid]={};
        _0xcfg.config.users[_0xid].reaction=_0xargs[0];
        _0xcfg.save();
        await _0xbug(_0xmsg,_0xclient,'Reaction changed ✅',3);
    }catch(_0xerr){await _0xclient.sendMessage(_0xmsg.key.remoteJid,{text:'❌ Error changing reaction: '+_0xerr.message});}
}

export async function _0xsetWelcome(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xtext=_0xmsg.message?.conversation?.slice(1).trim().split(/\s+/).slice(1);
        const _0xopt=_0xtext[0]?.toLowerCase();
        if(!_0xcfg.config.users[_0xid])return;
        if(_0xopt==='on')_0xcfg.config.users[_0xid].welcome=true,_0xcfg.save(),await _0xbug(_0xmsg,_0xclient,'Welcome turned on ✅',5);
        else if(_0xopt==='off')_0xcfg.config.users[_0xid].welcome=false,_0xcfg.save(),await _0xbug(_0xmsg,_0xclient,'Welcome turned off 🚫',5);
        else await _0xclient.sendMessage(_0xmsg.key.remoteJid,{text:'_Please specify on/off_'});
    }catch(_0xerr){console.error('Error changing welcome:',_0xerr);}
}

export async function _0xsetAutoRecord(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xtext=_0xmsg.message?.conversation?.slice(1).trim().split(/\s+/).slice(1);
        const _0xopt=_0xtext[0]?.toLowerCase();
        if(!_0xcfg.config.users[_0xid])return;
        _0xcfg.config.users[_0xid].autorecord=_0xopt==='on';
        _0xcfg.save();
        await _0xbug(_0xmsg,_0xclient,`AutoRecord turned ${_0xopt}`,5);
    }catch(_0xerr){console.error('Error changing autorecord:',_0xerr);}
}

export async function _0xsetAutoType(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xtext=_0xmsg.message?.conversation?.slice(1).trim().split(/\s+/).slice(1);
        const _0xopt=_0xtext[0]?.toLowerCase();
        if(!_0xcfg.config.users[_0xid])return;
        _0xcfg.config.users[_0xid].type=_0xopt==='on';
        _0xcfg.save();
        await _0xbug(_0xmsg,_0xclient,`AutoType turned ${_0xopt}`,5);
    }catch(_0xerr){console.error('Error changing autotype:',_0xerr);}
}

export async function _0xisPublic(_0xmsg,_0xclient){
    const _0xid=_0xclient.user.id.split(':')[0];
    try{
        const _0xtext=_0xmsg.message?.conversation?.slice(1).trim().split(/\s+/).slice(1);
        const _0xopt=_0xtext[0]?.toLowerCase();
        if(!_0xcfg.config.users[_0xid])return;
        _0xcfg.config.users[_0xid].publicMode=_0xopt==='on';
        _0xcfg.save();
        await _0xclient.sendMessage(_0xmsg.key.remoteJid,{text:_0xopt==='on'?'✅ Mode public activé':'🚫 Mode public désactivé'});
    }catch(_0xerr){console.error('Error changing public mode:',_0xerr);}
}

export default {
    setPrefix:_0xsetPrefix,
    setReaction:_0xsetReaction,
    setWelcome:_0xsetWelcome,
    setAutoRecord:_0xsetAutoRecord,
    setAutoType:_0xsetAutoType,
    isPublic:_0xisPublic
};