const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const { handleConnection } = require('./events/connection');
const { handleMessages, handleMessageDelete, handleCall } = require('./events/messages');
const { handleGroupUpdate } = require('./events/groupUpdate');
const { setSocket, setConnected } = require('./utils/botState');

const AUTH_DIR = path.join(__dirname, 'auth');

let sock = null;
let pairingCodeResolve = null;

async function startBot(phoneNumber) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const logger = pino({ level: 'silent' });

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    logger,
    browser: Browsers.macOS('Safari'),
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: true
  });

  setSocket(sock);

  // Creds update
  sock.ev.on('creds.update', saveCreds);

  // Connection update
  sock.ev.on('connection.update', (update) => {
    handleConnection(update, sock, () => startBot(phoneNumber));
    if (update.connection === 'open') {
      setConnected(true);
    } else if (update.connection === 'close') {
      setConnected(false);
    }
  });

  // Messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    handleMessages(sock, { messages });
  });

  // Message delete
  sock.ev.on('messages.delete', async (update) => {
    handleMessageDelete(sock, update);
  });

  // Group updates
  sock.ev.on('groups.update', async (updates) => {
    handleGroupUpdate(sock, updates);
  });

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    handleGroupUpdate(sock, [{ id, participants, action }]);
  });

  // Calls
  sock.ev.on('call', async (calls) => {
    handleCall(sock, calls);
  });

  // Request pairing code if not registered and phone provided
  if (phoneNumber && !state.creds.registered) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`[BOTIFY X] Pairing code for ${phoneNumber}: ${code}`);
      return code;
    } catch (err) {
      console.error('[BOTIFY X] Pairing code error:', err.message);
      throw err;
    }
  }

  return null;
}

module.exports = { startBot };
