async function handle({ sock, from, args, isAdmin, antieditState }) {
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use this command.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'on') {
    antieditState.enabled = true;
    await sock.sendMessage(from, { text: '✏️ Antiedit is now *ON*. Edited messages will show the original.' });
  } else if (sub === 'off') {
    antieditState.enabled = false;
    await sock.sendMessage(from, { text: '✏️ Antiedit is now *OFF*.' });
  } else {
    await sock.sendMessage(from, { text: `✏️ Antiedit is *${antieditState.enabled ? 'ON' : 'OFF'}*.\nUsage: *antiedit on/off` });
  }
}

module.exports = { handle };
