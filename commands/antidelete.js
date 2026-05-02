async function handle({ sock, from, args, isAdmin, antideleteState }) {
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use this command.' });
  if (from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Antidelete only works in private chats.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'on') {
    antideleteState.enabled = true;
    await sock.sendMessage(from, { text: '🗑️ Antidelete is now *ON*. Deleted messages will be shown.' });
  } else if (sub === 'off') {
    antideleteState.enabled = false;
    await sock.sendMessage(from, { text: '🗑️ Antidelete is now *OFF*.' });
  } else {
    await sock.sendMessage(from, { text: `🗑️ Antidelete is *${antideleteState.enabled ? 'ON' : 'OFF'}*.\nUsage: *antidelete on/off` });
  }
}

module.exports = { handle };
