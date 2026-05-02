const { Boom } = require('@hapi/boom');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const { setConnected } = require('../utils/botState');

const CONNECTION_MESSAGE = `━━━━━━━━━━━━━━━
BOTIFY X v1.0.3
━━━━━━━━━━━━━━━

✅ Connected successfully
⚡ System online
🔐 Secure session active`;

function handleConnection(update, sock, startBot) {
  const { connection, lastDisconnect } = update;

  if (connection === 'close') {
    setConnected(false);
    const shouldReconnect =
      lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;

    console.log('[BOTIFY X] Connection closed. Reconnecting:', shouldReconnect);
    if (shouldReconnect) {
      setTimeout(() => startBot(), 3000);
    }
  } else if (connection === 'open') {
    setConnected(true);
    console.log('[BOTIFY X] ✅ Connected to WhatsApp!');
    const adminJid = process.env.ADMIN_NUMBER
      ? `${process.env.ADMIN_NUMBER.replace(/[^0-9]/g, '')}@s.whatsapp.net`
      : null;

    if (adminJid) {
      setTimeout(() => {
        sock.sendMessage(adminJid, { text: CONNECTION_MESSAGE }).catch(() => {});
      }, 3000);
    }
  } else if (connection === 'connecting') {
    console.log('[BOTIFY X] Connecting to WhatsApp...');
  }
}

module.exports = { handleConnection };
