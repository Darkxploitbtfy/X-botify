async function handle({ sock, from, msg, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can kick members.' });

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  let target = quoted?.participant || null;

  if (!target) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    target = mentioned?.[0] || null;
  }

  if (!target) return sock.sendMessage(from, { text: '❌ Reply to a user or mention them to kick.\nUsage: *kick (reply or @mention)' });

  try {
    await sock.sendMessage(from, {
      text: `👢 Kicking @${target.split('@')[0]}...`,
      mentions: [target]
    });
    await sock.groupParticipantsUpdate(from, [target], 'remove');
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to kick. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
