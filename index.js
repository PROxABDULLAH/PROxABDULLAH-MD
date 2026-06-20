const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID, makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');

// ============== CONFIG ==============
const prefix = config.PREFIX || '.';
const ownerNumber = ['923237045919'];

// ============== KEEP PROCESS ALIVE ==============
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});
const originalExit = process.exit;
process.exit = function(code) {
  console.log(`🚫 Blocked process.exit(${code})`);
};
setInterval(() => {
  console.log('🔵 Heartbeat – event loop alive');
}, 30000);

// ============== EXPRESS SERVER ==============
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;
app.get("/", (req, res) => res.send("PROxABDULLAH-MD STARTED ✅"));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// ============== SESSION & TEMP DIR ==============
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), () => {});
    }
  });
}, 5 * 60 * 1000);

// ============== SESSION LOAD ==============
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID.replace("PROxABDULLAH-MD~", '');
  try {
    const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
    fs.writeFileSync(__dirname + '/sessions/creds.json', decodedData);
    console.log("Session loaded ✅");
  } catch (err) {
    console.error("Error decoding session data:", err);
    throw err;
  }
}

// ============== WHATSAPP CONNECTION ==============
async function connectToWA() {
  console.log("Connecting to WhatsApp ⏳️...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
  var { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  // ============== HELPER FUNCTIONS (from your original) ==============
  conn.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };
  conn.copyNForward = async(jid, message, forceForward = false, options = {}) => { /* keep as is */ };
  conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => { /* keep as is */ };
  conn.downloadMediaMessage = async(message) => { /* keep as is */ };
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => { /* keep as is */ };
  conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => { /* keep as is */ };
  conn.getFile = async(PATH, save) => { /* keep as is */ };
  conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => { /* keep as is */ };
  conn.parseMention = async(text) => { /* keep as is */ };
  conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => { /* keep as is */ };
  conn.sendVideoAsSticker = async (jid, buff, options = {}) => { /* keep as is */ };
  conn.sendImageAsSticker = async (jid, buff, options = {}) => { /* keep as is */ };
  conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => { /* keep as is */ };
  conn.sendImage = async(jid, path, caption = '', quoted = '', options) => { /* keep as is */ };
  conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text, ...options }, { quoted });
  conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => { /* keep as is */ };
  conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => { /* keep as is */ };
  conn.getName = (jid, withoutContact = false) => { /* keep as is */ };
  conn.sendContact = async (jid, kon, quoted = '', opts = {}) => { /* keep as is */ };
  conn.setStatus = status => { /* keep as is */ };
  conn.serializeM = mek => sms(conn, mek);

  // ============== EVENT: connection.update ==============
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('🧬 Installing Plugins');
      const path = require('path');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() == ".js") {
          require("./plugins/" + plugin);
        }
      });
      console.log('Plugins installed successful ✅');
      console.log('Bot connected to whatsapp ✅');

      // Send welcome message
      let up = `*Hello there PROxABDULLAH-MD User! 👋* \n\n> Simple, Straight Forward But Loaded With Features 🎨, Meet PROxABDULLAH-MD WhatsApp Bot.\n\n *Thanks for using PROxABDULLAH-MD 🚀* \n\n> Join WhatsApp Channel :- ⤵️\n \nhttps://whatsapp.com/channel/0029VbAeVGu4o7qFfdhttJ0y \n\n- *YOUR PREFIX:* = ${prefix}\n\nDont forget to give star to repo ⬇️\n\nhttps://github.com/abdullah219660/PROxABDULLAH-MD\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ PROxABDULLAH-MD Official ❣️ 🫶`;
      conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/15onba.png` }, caption: up });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ============== EVENT: messages.update (anti-delete) ==============
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        console.log("Delete Detected:", JSON.stringify(update, null, 2));
        await AntiDelete(conn, updates);
      }
    }
  });

  // ============== EVENT: group-participants.update ==============
  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  // ============== EVENT: messages.upsert (MAIN MESSAGE HANDLER) ==============
  conn.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;

    // Decrypt ephemeral
    if (getContentType(mek.message) === 'ephemeralMessage') {
      mek.message = mek.message.ephemeralMessage.message;
    }

    // Save message
    await saveMessage(mek);

    // ====== AUTO STATUS ======
    if (mek.key && mek.key.remoteJid === 'status@broadcast') {
      if (config.AUTO_STATUS_SEEN === "true") await conn.readMessages([mek.key]);
      if (config.AUTO_STATUS_REACT === "true") {
        const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await conn.sendMessage(mek.key.remoteJid, {
          react: { text: randomEmoji, key: mek.key }
        }, { statusJidList: [mek.key.participant] });
      }
      if (config.AUTO_STATUS_REPLY === "true") {
        const user = mek.key.participant;
        const text = config.AUTO_STATUS_MSG || "✨";
        await conn.sendMessage(user, { text: text }, { quoted: mek });
      }
      return; // don't process status messages as commands
    }

    // ====== AUTO READ ======
    if (config.READ_MESSAGE === 'true') {
      await conn.readMessages([mek.key]);
    }

    // ====== GET CONTEXT ======
    const m = sms(conn, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = conn.user.id.split(':')[0];
    const isOwner = ownerNumber.includes(senderNumber) || (botNumber === senderNumber);

    // ====== EXTRACT BODY PROPERLY ======
    let body = '';
    if (type === 'conversation') {
      body = mek.message.conversation || '';
    } else if (type === 'extendedTextMessage') {
      body = mek.message.extendedTextMessage.text || '';
    } else if (type === 'imageMessage') {
      body = mek.message.imageMessage.caption || '';
    } else if (type === 'videoMessage') {
      body = mek.message.videoMessage.caption || '';
    } else if (type === 'viewOnceMessageV2') {
      const inner = mek.message.viewOnceMessageV2.message;
      if (inner) {
        const innerType = getContentType(inner);
        body = inner[innerType]?.caption || '';
      }
    } else {
      // fallback
      body = mek.message.conversation || mek.message.extendedTextMessage?.text || '';
    }

    // ====== CHECK IF COMMAND ======
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    // ====== LOAD COMMANDS (they should already be loaded) ======
    const events = require('./command');
    if (!events || !events.commands) {
      console.error('❌ Command module not loaded');
      return;
    }

    const cmd = events.commands.find(c => c.pattern === command) ||
                events.commands.find(c => c.alias && c.alias.includes(command));

    if (cmd) {
      console.log(`⚡ Executing command: ${command} from ${senderNumber}`);
      try {
        // Context object
        const ctx = {
          from, quoted: mek, body, isCmd, command, args, q, text: q,
          isGroup, sender, senderNumber, botNumber,
          pushname: mek.pushName || 'Unknown',
          isOwner: isOwner,
          groupMetadata: isGroup ? await conn.groupMetadata(from).catch(() => null) : null,
          groupName: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.subject : '',
          participants: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants : [],
          groupAdmins: isGroup ? getGroupAdmins((await conn.groupMetadata(from).catch(() => null))?.participants) : [],
          isBotAdmins: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants?.some(p => p.id === conn.user.id && p.admin) : false,
          isAdmins: isGroup ? (await conn.groupMetadata(from).catch(() => null))?.participants?.some(p => p.id === sender && p.admin) : false,
          reply: (text) => conn.sendMessage(from, { text }, { quoted: mek }),
          react: (emoji) => conn.sendMessage(from, { react: { text: emoji, key: mek.key } })
        };

        if (cmd.react) {
          await conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        }

        await cmd.function(conn, mek, m, ctx);
      } catch (e) {
        console.error(`❌ Error in command ${command}:`, e);
        await conn.sendMessage(from, { text: `⚠️ Command failed: ${e.message || 'Unknown error'}` }, { quoted: mek });
      }
    } else if (isCmd) {
      console.log(`❓ Unknown command: ${command}`);
    }

    // ====== OTHER PLUGIN TRIGGERS (on: body, text, image, sticker) ======
    // If you have plugins that trigger on "body", "text", etc., you can add them here.
    // But most commands are handled above.
  });

  return conn;
}

// ============== START ==============
setTimeout(() => {
  connectToWA();
}, 4000);
