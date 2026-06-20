const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const P = require('pino');
const config = require('./config');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const express = require('express');

// ============== CONFIG ==============
const ownerNumber = ['923237045919'];
const prefix = config.PREFIX || '.';

// ============== KEEP PROCESS ALIVE ==============
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});
// Block process.exit
const originalExit = process.exit;
process.exit = function(code) {
  console.log(`🚫 Blocked process.exit(${code})`);
};
setInterval(() => {
  console.log('🔵 Heartbeat – event loop alive');
}, 30000);

// ============== SESSION FOLDER ==============
if (!fs.existsSync('./sessions')) {
  fs.mkdirSync('./sessions');
}

// ============== EXPRESS SERVER ==============
const app = express();
const port = process.env.PORT || 9090;
app.get('/', (req, res) => res.send('PROxABDULLAH-MD STARTED ✅'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// ============== COMMAND LOADER ==============
let commandList = [];
function loadCommands() {
  const pluginsPath = path.join(__dirname, 'plugins');
  if (!fs.existsSync(pluginsPath)) {
    console.warn('⚠️ Plugins folder not found!');
    return;
  }
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const cmd = require(path.join(pluginsPath, file));
      if (cmd && typeof cmd === 'object') {
        // If the plugin exports a single command object
        if (cmd.pattern) commandList.push(cmd);
        else if (Array.isArray(cmd)) commandList.push(...cmd);
      }
    } catch (e) {
      console.error(`❌ Failed to load plugin ${file}:`, e);
    }
  }
  console.log(`✅ Loaded ${commandList.length} commands`);
}
loadCommands();

// ============== WHATSAPP CONNECTION ==============
async function connectToWA() {
  console.log('Connecting to WhatsApp ⏳️...');
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Firefox'),
    syncFullHistory: true,
    auth: state,
    version
  });

  // Extend conn with helper methods (from your code)
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server) ? decode.user + '@' + decode.server : jid;
    }
    return jid;
  };
  // ... add other helpers if needed (copyNForward, downloadMediaMessage, etc.)
  // I'll add the most important ones:
  conn.sendText = (jid, text, quoted = '', options) =>
    conn.sendMessage(jid, { text, ...options }, { quoted });
  conn.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path :
      /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') :
      /^https?:\/\//.test(path) ? await getBuffer(path) :
      fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return conn.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
  };
  // (You can add more if needed)

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('🔄 Reconnecting...');
        connectToWA();
      } else {
        console.log('❌ Logged out, delete sessions and restart.');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected to WhatsApp');
      // Send welcome message (if needed)
      try {
        const up = `*Hello there PROxABDULLAH-MD User! 👋*\n\n> Simple, Straight Forward But Loaded With Features 🎨\n\n*Thanks for using PROxABDULLAH-MD 🚀*\n\n> Join WhatsApp Channel:- ⤵️\nhttps://whatsapp.com/channel/0029VbAeVGu4o7qFfdhttJ0y\n\n- *YOUR PREFIX:* = ${prefix}\n\nDont forget to give star to repo ⬇️\n\nhttps://github.com/abdullah219660/PROxABDULLAH-MD\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ PROxABDULLAH-MD Official ❣️`;
        await conn.sendMessage(conn.user.id, { image: { url: 'https://files.catbox.moe/15onba.png' }, caption: up });
      } catch (e) {
        console.warn('Welcome message failed:', e.message);
      }
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ========== MESSAGE HANDLER ==========
  conn.ev.on('messages.upsert', async (mek) => {
    const msg = mek.messages[0];
    if (!msg || !msg.message) return;

    // Decrypt ephemeral
    if (getContentType(msg.message) === 'ephemeralMessage') {
      msg.message = msg.message.ephemeralMessage.message;
    }

    const from = msg.key.remoteJid;
    const sender = msg.key.fromMe
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
      : (msg.key.participant || msg.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');

    // Get body text
    let body = '';
    const type = getContentType(msg.message);
    if (type === 'conversation') body = msg.message.conversation || '';
    else if (type === 'extendedTextMessage') body = msg.message.extendedTextMessage.text || '';
    else if (type === 'imageMessage') body = msg.message.imageMessage.caption || '';
    else if (type === 'videoMessage') body = msg.message.videoMessage.caption || '';
    else if (type === 'viewOnceMessageV2') {
      const inner = msg.message.viewOnceMessageV2.message;
      if (inner) {
        const innerType = getContentType(inner);
        body = inner[innerType]?.caption || '';
      }
    }
    // if still empty, try message.extendedTextMessage?
    if (!body && msg.message.extendedTextMessage) body = msg.message.extendedTextMessage.text || '';

    // If it's a command
    const isCmd = body.startsWith(prefix);
    const cmdName = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    // Find command
    const cmd = commandList.find(c =>
      c.pattern === cmdName || (c.alias && c.alias.includes(cmdName))
    );

    if (cmd) {
      console.log(`⚡ Executing command: ${cmdName} from ${senderNumber}`);
      try {
        // Prepare context
        const context = {
          from,
          quoted: msg,
          body,
          isCmd,
          command: cmdName,
          args,
          q,
          text: q,
          isGroup,
          sender,
          senderNumber,
          botNumber: conn.user.id.split(':')[0],
          pushname: msg.pushName || 'Unknown',
          isOwner: ownerNumber.includes(senderNumber) || (conn.user.id.split(':')[0] === senderNumber),
          groupMetadata: isGroup ? await conn.groupMetadata(from).catch(() => null) : null,
          groupName: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.subject : '',
          participants: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants : [],
          groupAdmins: isGroup ? getGroupAdmins((await conn.groupMetadata(from).catch(() => null))?.participants) : [],
          isBotAdmins: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants?.some(p => p.id === conn.user.id && p.admin) : false,
          isAdmins: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants?.some(p => p.id === sender && p.admin) : false,
          reply: (text) => conn.sendMessage(from, { text }, { quoted: msg }),
          // Add other helpers like react, etc.
          react: (emoji) => conn.sendMessage(from, { react: { text: emoji, key: msg.key } })
        };

        // React if defined
        if (cmd.react) {
          await conn.sendMessage(from, { react: { text: cmd.react, key: msg.key } });
        }

        // Execute
        await cmd.function(conn, msg, context);
      } catch (e) {
        console.error(`❌ Error in command ${cmdName}:`, e);
        await conn.sendMessage(from, { text: `⚠️ Command failed: ${e.message || 'Unknown error'}` }, { quoted: msg });
      }
    } else if (isCmd) {
      console.log(`❓ Unknown command: ${cmdName}`);
      // Optionally reply
      // await conn.sendMessage(from, { text: `❌ Unknown command: ${cmdName}` }, { quoted: msg });
    }
  });

  // ========== GROUP EVENTS (optional) ==========
  // You can add group-participants.update here if needed

  // ========== OTHER EVENTS ==========
  // messages.update for anti-delete, etc.
}

// ========== START BOT ==========
setTimeout(() => {
  connectToWA();
}, 4000);
