const sharp = require('sharp');

async function handle({ sock, from, msg }) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMsg = ctx?.quotedMessage;

  const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
  if (!imageMsg) {
    return sock.sendMessage(from, { text: '❌ Reply to an image to convert it to a sticker.\nUsage: *sticker (reply to image)' });
  }

  try {
    let buffer;
    if (msg.message?.imageMessage) {
      buffer = await sock.downloadMediaMessage(msg);
    } else {
      buffer = await sock.downloadMediaMessage({ message: quotedMsg, key: { ...msg.key, id: ctx.stanzaId } });
    }

    const stickerBuffer = await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();

    await sock.sendMessage(from, {
      sticker: stickerBuffer
    });
  } catch (err) {
    console.error('[Sticker Error]', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to create sticker. Please try with a valid image.' });
  }
}

module.exports = { handle };
