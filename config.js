const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "PROxABDULLAH-MD~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoidU9ZcDR3TmdqN21QdVdUNkxXOHFoWUVYcFZ4Zi9Odldwdmp0ZEhueWNtYz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoidTd0VFBKT2xQU1R0MWtTQzkwTGNzMFBiSFB6cDRwejlTaWhWNExrUUFoaz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJFQWJQM0x0YWtKUEROMDZhNHQwM21aZHdwWGlxUFFGYTkvaklvNnhTNzFnPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJqOUdianNEb3pVTUhpSkFsR0JZd2lycWd3cVBCWktvMjJZT3Vqbm42MTMwPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkdNdFpadGMvTWJsTVA4RGh1b3kxcldGM1g5dzVBcThuWWFTSElEUUpqM3c9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IlZVWW8xOGZSSTd3R0h2WEpobGQwNlYralAraEdNZUdYdEtJVGVkeG5OWGM9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiOEFMVUZVMGVFQ0FSNEFBWnBDQ05FcUJJQWNZWXZ2S0JEVDlxZDVVbzUzcz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNW5BMzB6UkhlQ3VlVms1dlNJb2ppYnFQb0VOZXdTc0RrRlhPYTlUNU9oST0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InJ0MzZsSUV2WmM3L1gxSHAvQmxYOXJ0djNZTW90dG0rS0ZjNzhBc1hQQlZXSG1YajFMNkRqVUp3cWRwY3NyUStRdXViY0gyOTVyWjlwOU5RSlJwRGl3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTM0LCJhZHZTZWNyZXRLZXkiOiIrQUVjVHA1YXVjdUFaUTIvY0dCd0dJYmppWk9xYnZBUXdRWVRDYzd2Wmw0PSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6ODEzLCJmaXJzdFVudXBsb2FkZWRQcmVLZXlJZCI6ODEzLCJhY2NvdW50U3luY0NvdW50ZXIiOjAsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJyZWdpc3RlcmVkIjp0cnVlLCJwYWlyaW5nQ29kZSI6Ik5QRkhSRzRUIiwibWUiOnsiaWQiOiI5MjMyMTM1MDk4NDY6MjZAcy53aGF0c2FwcC5uZXQiLCJuYW1lIjoi6qeB8JOGqVDKgOG0j3hBypnhtIXhtJzKn8qf4bSAypzwk4aq6qeCIiwibGlkIjoiMTU5NTM2OTk2NDc5MDAwOjI2QGxpZCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDUFMzcmF3RUVORFAydEVHR0I0Z0FTZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoiWmVNMU13ZUFtdzlBMTdHMWhnQnZBQkFaVlBXc2hxVklwSUYrdTFBdm5uST0iLCJhY2NvdW50U2lnbmF0dXJlIjoiTWZ6U3lsQXNFYkp6b2xXOWQ3WW5hbHVFYU1DWnMzNnJ4YW95ZE1VRFpObmhudFJDWDkxUjB0elREcnZrRFpnRzhjOTdUSXpDdGZRNVFuZ0RYSHVMQlE9PSIsImRldmljZVNpZ25hdHVyZSI6InBqVm5pOTJaQ1VrdzU1YmNjUWZHOTFjZWw3T2djNStseFhoU2N6MEFidUYrUnpVY1k2UHQ1MkNSQ0tCc0VjNzhRajhYSE8rOFN1MldEN2lZQkJwV2h3PT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiMTU5NTM2OTk2NDc5MDAwOjI2QGxpZCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJXWGpOVE1IZ0pzUFFOZXh0WVlBYndBUUdWVDFySWFsU0tTQmZydFFMNTV5In19XSwicGxhdGZvcm0iOiJzbWJhIiwicm91dGluZ0luZm8iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJDQVVJQWdnTiJ9LCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3ODE5NjY4MDV9",
// add your Session Id 
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
// make true or false status auto seen
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
// make true if you want auto reply on status 
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// make true if you want auto reply on status 
AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY PROxABDULLAH-MD*",
// set the auto reply massage on status reply  
ANTI_DELETE: process.env.ANTI_DELETE || "false",
// set true false for anti delete     
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox", 
// change it to 'same' if you want to resend deleted message in same chat     
WELCOME: process.env.WELCOME || "false",
// true if want welcome and goodbye msg in groups    
ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
// make true to know who dismiss or promoted a member in group
ANTI_LINK: process.env.ANTI_LINK || "true",
// make anti link true,false for groups 
MENTION_REPLY: process.env.MENTION_REPLY || "false",
// make true if want auto voice reply if someone menetion you 
MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/xo1mu5.png",
// add custom menu and mention reply image url
PREFIX: process.env.PREFIX || ".",
// add your prifix for bot   
BOT_NAME: process.env.BOT_NAME || "PROxABDULLAH-MD",
// add bot namw here for menu
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// true to get auto status react
STICKER_NAME: process.env.STICKER_NAME || "PROxABDULLAH-MD",
// type sticker pack name 
CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
// make this true for custum emoji react    
CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
// chose custom react emojis by yourself 
DELETE_LINKS: process.env.DELETE_LINKS || "false",
// automatic delete links witho remove member 
OWNER_NUMBER: process.env.OWNER_NUMBER || "923213509846",
// add your bot owner number
OWNER_NAME: process.env.OWNER_NAME || "PROxABDULLAH-MD Official",
// add bot owner name
DESCRIPTION: process.env.DESCRIPTION || "*©𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 PROxABDULLAH-MD*",
// add bot owner name    
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/xo1mu5.png",
// add img for alive msg
LIVE_MSG: process.env.LIVE_MSG || "> I'm alive*PROxABDULLAH-MD*🇵🇰",
// add alive msg here 
READ_MESSAGE: process.env.READ_MESSAGE || "false",
// Turn true or false for automatic read msgs
AUTO_REACT: process.env.AUTO_REACT || "false",
// make this true or false for auto react on all msgs
ANTI_BAD: process.env.ANTI_BAD || "false",
// false or true for anti bad words  
MODE: process.env.MODE || "public",
// make bot public-private-inbox-group 
ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "false",
// make anti link true,false for groups 
AUTO_STICKER: process.env.AUTO_STICKER || "false",
// make true for automatic stickers 
AUTO_REPLY: process.env.AUTO_REPLY || "false",
// make true or false automatic text reply 
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
// maks true for always online 
PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
// make false if want private mod
AUTO_TYPING: process.env.AUTO_TYPING || "false",
// true for automatic show typing   
READ_CMD: process.env.READ_CMD || "false",
// true if want mark commands as read 
DEV: process.env.DEV || "923213509846",
//replace with your whatsapp number        
ANTI_VV: process.env.ANTI_VV || "true",
// true for anti once view 
AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
// make it true for auto recoding 
};
