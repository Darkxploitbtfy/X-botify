const { setBotMode, getBotMode } = require('../utils/dataManager');

async function handle({ sock, from, args, isAdmin }) {
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only the admin can change bot mode.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'public') {
    setBotMode('public');
    await sock.sendMessage(from, { text: '🌍 Bot mode set to *PUBLIC*. Everyone can use commands.' });
  } else if (sub === 'private') {
    setBotMode('private');
    await sock.sendMessage(from, { text: '🔒 Bot mode set to *PRIVATE*. Only admin can use commands.' });
  } else {
    const current = getBotMode();
    await sock.sendMessage(from, {
      text: `⚙️ Current mode: *${current.toUpperCase()}*\nUsage: *mode public/private`
    });
  }
}

module.exports = { handle };
