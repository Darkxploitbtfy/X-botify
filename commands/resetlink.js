async function handle({ sock, from, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can reset the group link.' });

  try {
    const newCode = await sock.groupRevokeInvite(from);
    const newLink = `https://chat.whatsapp.com/${newCode}`;
    await sock.sendMessage(from, { text: `🔗 Group link has been reset!\n\nNew link: ${newLink}` });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to reset link. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
