async function handle({ sock, from, msg, argStr, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can use *hidetag.' });

  if (!argStr) return sock.sendMessage(from, { text: '❌ Please provide a message.\nUsage: *hidetag Hello everyone' });

  try {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    await sock.sendMessage(from, { text: argStr, mentions: members });
    // Delete the command message
    await sock.sendMessage(from, { delete: msg.key });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
