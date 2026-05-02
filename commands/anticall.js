async function handle({ sock, from, args, isAdmin, anticallState }) {
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use this command.' });

  const sub = args[0]?.toLowerCase();
  if (sub === 'on') {
    anticallState.enabled = true;
    await sock.sendMessage(from, { text: "📵 Anticall is now *ON*. Incoming calls will be rejected." });
  } else if (sub === 'off') {
    anticallState.enabled = false;
    await sock.sendMessage(from, { text: "📵 Anticall is now *OFF*." });
  } else {
    await sock.sendMessage(from, { text: `📵 Anticall is *${anticallState.enabled ? 'ON' : 'OFF'}*.\nUsage: *anticall on/off` });
  }
}

module.exports = { handle };
