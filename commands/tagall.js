async function handle({ sock, from, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use *tagall.' });

  try {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    const mentions = members;
    const text = members.map(m => `@${m.split('@')[0]}`).join(' ');
    await sock.sendMessage(from, { text: `📣 Tagging everyone:\n${text}`, mentions });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to tag all. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
