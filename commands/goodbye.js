const { updateGroupSettings, getGroupSettings } = require('../utils/dataManager');

async function handle({ sock, from, args, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use this command.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'on') {
    updateGroupSettings(from, { goodbye: true });
    await sock.sendMessage(from, { text: '👋 Goodbye messages are now *ON*.' });
  } else if (sub === 'off') {
    updateGroupSettings(from, { goodbye: false });
    await sock.sendMessage(from, { text: '👋 Goodbye messages are now *OFF*.' });
  } else {
    const current = getGroupSettings(from).goodbye;
    await sock.sendMessage(from, { text: `👋 Goodbye is *${current ? 'ON' : 'OFF'}*.\nUsage: *goodbye on/off` });
  }
}

module.exports = { handle };
