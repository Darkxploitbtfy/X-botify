const { checkAccess, getDenyMessage, isAdmin } = require('../utils/access');
const { getGroupSettings, addWarning, resetWarnings, getAdminJid } = require('../utils/dataManager');
const { getAdminJid: getAdminJidFn } = require('../utils/access');

// Command imports
const antilinkCmd = require('../commands/antilink');
const anticallCmd = require('../commands/anticall');
const antideleteCmd = require('../commands/antidelete');
const antieditCmd = require('../commands/antiedit');
const promoteCmd = require('../commands/promote');
const demoteCmd = require('../commands/demote');
const kickCmd = require('../commands/kick');
const resetlinkCmd = require('../commands/resetlink');
const welcomeCmd = require('../commands/welcome');
const goodbyeCmd = require('../commands/goodbye');
const tagallCmd = require('../commands/tagall');
const hidetagCmd = require('../commands/hidetag');
const vvCmd = require('../commands/vv');
const getppCmd = require('../commands/getpp');
const pingCmd = require('../commands/ping');
const modeCmd = require('../commands/mode');
const stickerCmd = require('../commands/sticker');
const menuCmd = require('../commands/menu');
const statusSaverCmd = require('../commands/statusSaver');

// State for anticall / antidelete / antiedit
const anticallState = { enabled: false };
const antideleteState = { enabled: false };
const antieditState = { enabled: false };
const deletedMessages = new Map();

async function handleMessages(sock, { messages }) {
  for (const msg of messages) {
    try {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const senderJid = isGroup
        ? (msg.key.participant || msg.pushName)
        : from;

      const sender = isGroup
        ? (msg.key.participant || msg.pushName || from)
        : from;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        '';

      const isViewOnce =
        msg.message?.viewOnceMessage ||
        msg.message?.viewOnceMessageV2 ||
        msg.message?.viewOnceMessageV2Extension;

      // Status saver (reply to status)
      if (from === 'status@broadcast') {
        await statusSaverCmd.handle(sock, msg);
        continue;
      }

      // Secret feature: reply to view-once with only emojis
      if (isViewOnce && /^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}]+$/u.test(body.trim()) && body.trim().length > 0) {
        await vvCmd.handleSecret(sock, msg, getAdminJidFn());
        continue;
      }

      // Anti-delete: track messages
      if (antideleteState.enabled && !isGroup) {
        deletedMessages.set(msg.key.id, msg);
      }

      // Antilink check for groups
      if (isGroup) {
        const groupSettings = getGroupSettings(from);
        if (groupSettings.antilink) {
          const linkRegex = /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/i;
          if (linkRegex.test(body)) {
            await sock.sendMessage(from, {
              delete: msg.key
            });
            const count = await addWarning(from, sender);
            if (count >= 5) {
              await sock.sendMessage(from, {
                text: `⚠️ @${sender.split('@')[0]} has been removed for repeatedly sending links.`,
                mentions: [sender]
              });
              try {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
              } catch {}
              resetWarnings(from, sender);
            } else {
              await sock.sendMessage(from, {
                text: `⚠️ @${sender.split('@')[0]}, links are not allowed here! Warning ${count}/5`,
                mentions: [sender]
              });
            }
            continue;
          }
        }
      }

      // Only process commands that start with *
      if (!body.startsWith('*')) continue;

      const [rawCmd, ...args] = body.trim().slice(1).split(' ');
      const command = rawCmd.toLowerCase();
      const argStr = args.join(' ').trim();

      // Access check
      const access = checkAccess(sender);
      if (!access.allowed) {
        await sock.sendMessage(from, { text: getDenyMessage(access.reason) });
        continue;
      }

      // Context object passed to commands
      const ctx = {
        sock,
        msg,
        from,
        sender,
        args,
        argStr,
        isGroup,
        isAdmin: access.isAdmin,
        quoted: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ? msg.message.extendedTextMessage.contextInfo
          : null,
        anticallState,
        antideleteState,
        antieditState,
        deletedMessages
      };

      switch (command) {
        case 'antilink':
          await antilinkCmd.handle(ctx);
          break;
        case 'anticall':
          await anticallCmd.handle(ctx);
          break;
        case 'antidelete':
          await antideleteCmd.handle(ctx);
          break;
        case 'antiedit':
          await antieditCmd.handle(ctx);
          break;
        case 'promote':
          await promoteCmd.handle(ctx);
          break;
        case 'demote':
          await demoteCmd.handle(ctx);
          break;
        case 'kick':
          await kickCmd.handle(ctx);
          break;
        case 'resetlink':
          await resetlinkCmd.handle(ctx);
          break;
        case 'welcome':
          await welcomeCmd.handle(ctx);
          break;
        case 'goodbye':
          await goodbyeCmd.handle(ctx);
          break;
        case 'tagall':
          await tagallCmd.handle(ctx);
          break;
        case 'hidetag':
          await hidetagCmd.handle(ctx);
          break;
        case 'vv':
          await vvCmd.handle(ctx);
          break;
        case 'getpp':
          await getppCmd.handle(ctx);
          break;
        case 'ping':
          await pingCmd.handle(ctx);
          break;
        case 'mode':
          await modeCmd.handle(ctx);
          break;
        case 'sticker':
        case 's':
          await stickerCmd.handle(ctx);
          break;
        case 'menu':
          await menuCmd.handle(ctx);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('[Message Handler Error]', err.message);
    }
  }
}

async function handleMessageDelete(sock, update) {
  if (!antideleteState.enabled) return;
  try {
    for (const key of update.keys || []) {
      const cached = deletedMessages.get(key.id);
      if (!cached || key.remoteJid.endsWith('@g.us')) return;
      const from = key.remoteJid;
      const text =
        cached.message?.conversation ||
        cached.message?.extendedTextMessage?.text ||
        '[Media message]';
      await sock.sendMessage(from, {
        text: `🗑️ *Deleted message detected:*\n\n${text}`
      });
    }
  } catch (err) {
    console.error('[AntiDelete Error]', err.message);
  }
}

async function handleCall(sock, calls) {
  if (!anticallState.enabled) return;
  for (const call of calls) {
    try {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
        await sock.sendMessage(call.from, {
          text: "📵 I can't receive calls at the moment."
        });
      }
    } catch (err) {
      console.error('[AntiCall Error]', err.message);
    }
  }
}

module.exports = { handleMessages, handleMessageDelete, handleCall };
