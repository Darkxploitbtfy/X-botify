async function handle({ sock, from, msg, isGroup, isAdmin }) {
  if (!isGroup) return sock.sendMessage(from, { text: '❌ This command only works in groups.' });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admin can demote members.' });

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  let target = quoted?.participant || null;

  if (!target) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    target = mentioned?.[0] || null;
  }

  if (!target) return sock.sendMessage(from, { text: '❌ Reply to a user or mention them to demote.\nUsage: *demote (reply or @mention)' });

  try {
    await sock.groupParticipantsUpdate(from, [target], 'demote');
    await sock.sendMessage(from, {
      text: `✅ @${target.split('@')[0]} has been demoted.`,
      mentions: [target]
    });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to demote. Make sure the bot is an admin.' });
  }
}

module.exports = { handle };
