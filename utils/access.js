const { isUserAllowed, getBotMode } = require('./dataManager');

const ADMIN_NUMBER = process.env.ADMIN_NUMBER || '';

function getAdminJid() {
  if (!ADMIN_NUMBER) return null;
  const clean = ADMIN_NUMBER.replace(/[^0-9]/g, '');
  return `${clean}@s.whatsapp.net`;
}

function isAdmin(jid) {
  const adminJid = getAdminJid();
  if (!adminJid) return false;
  return jid === adminJid || jid.split('@')[0] === adminJid.split('@')[0];
}

function checkAccess(senderJid) {
  const senderPhone = senderJid.split('@')[0];

  if (isAdmin(senderJid)) {
    return { allowed: true, isAdmin: true };
  }

  const mode = getBotMode();
  if (mode === 'private') {
    return { allowed: false, reason: 'private_mode', isAdmin: false };
  }

  const result = isUserAllowed(senderPhone);
  if (!result.allowed) {
    return { allowed: false, reason: result.reason, isAdmin: false };
  }

  return { allowed: true, isAdmin: false };
}

function getDenyMessage(reason) {
  if (reason === 'expired') return '❌ Your access has expired. Please contact the admin to renew.';
  if (reason === 'not_found') return '❌ You are not authorized to use this bot. Contact admin to get access.';
  if (reason === 'inactive') return '❌ Your access has been deactivated. Contact admin.';
  if (reason === 'private_mode') return '❌ Bot is currently in private mode. Only admin can use commands.';
  return '❌ Access denied.';
}

module.exports = { checkAccess, isAdmin, getDenyMessage, getAdminJid };
