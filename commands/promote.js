async function handle({ sock, from, msg, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can promote members.' });

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  let target = quoted?.participant || null;

  if (!target) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    target = mentioned?.[0] || null;
  }

  if (!target) return sock.sendMessage(from, { text: '❌ Reply to a user or mention them to promote.\nUsage: *promote (reply or @mention)' });

  try {
    await sock.groupParticipantsUpdate(from, [target], 'promote');
    await sock.sendMessage(from, {
      text: `✅ @${target.split('@')[0]} has been promoted to admin!`,
      mentions: [target]
    });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to promote. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
