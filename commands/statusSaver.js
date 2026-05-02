async function handle(sock, msg) {
  try {
    const adminJid = process.env.ADMIN_NUMBER
      ? `${process.env.ADMIN_NUMBER.replace(/[^0-9]/g, '')}@s.whatsapp.net`
      : null;

    if (!adminJid) return;

    const imageMsg = msg.message?.imageMessage;
    const videoMsg = msg.message?.videoMessage;
    const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    if (imageMsg) {
      const buffer = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(adminJid, {
        image: buffer,
        caption: `📸 *Status saved!*\nFrom: ${msg.key.participant || msg.pushName || 'Unknown'}`
      });
    } else if (videoMsg) {
      const buffer = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(adminJid, {
        video: buffer,
        caption: `🎥 *Status saved!*\nFrom: ${msg.key.participant || msg.pushName || 'Unknown'}`
      });
    } else if (textMsg) {
      await sock.sendMessage(adminJid, {
        text: `📝 *Status saved!*\nFrom: ${msg.key.participant || msg.pushName || 'Unknown'}\n\n${textMsg}`
      });
    }
  } catch (err) {
    console.error('[StatusSaver Error]', err.message);
  }
}

module.exports = { handle };
