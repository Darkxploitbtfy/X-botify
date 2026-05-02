async function handle({ sock, from }) {
  const start = Date.now();
  await sock.sendMessage(from, { text: '⏳ Pinging...' });
  const end = Date.now();
  await sock.sendMessage(from, {
    text: `🏓 *Pong!*\n⚡ Response time: *${end - start}ms*\n🤖 BOTIFY X v1.0.3 is online!`
  });
}

module.exports = { handle };
