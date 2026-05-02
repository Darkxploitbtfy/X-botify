const { updateGroupSettings, getGroupSettings } = require('../utils/dataManager');

async function handle({ sock, from, args, isGroup, isAdmin, msg }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use this command.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'on') {
    updateGroupSettings(from, { antilink: true });
    await sock.sendMessage(from, { text: '🔗 Antilink is now *ON*. Links will be deleted and users warned.' });
  } else if (sub === 'off') {
    updateGroupSettings(from, { antilink: false });
    await sock.sendMessage(from, { text: '🔗 Antilink is now *OFF*.' });
  } else {
    const current = getGroupSettings(from).antilink;
    await sock.sendMessage(from, { text: `🔗 Antilink is currently *${current ? 'ON' : 'OFF'}*.\nUsage: *antilink on/off` });
  }
}

module.exports = { handle };
