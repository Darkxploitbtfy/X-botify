const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');
const WARNINGS_FILE = path.join(__dirname, '../data/warnings.json');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Users
function getUsers() {
  return readJSON(USERS_FILE) || [];
}

function addUser(phone, days = 30) {
  const users = getUsers();
  const existing = users.find(u => u.phone === phone);
  if (existing) {
    existing.expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    existing.active = true;
    writeJSON(USERS_FILE, users);
    return existing;
  }
  const user = {
    phone,
    expiry: Date.now() + days * 24 * 60 * 60 * 1000,
    active: true,
    addedAt: Date.now()
  };
  users.push(user);
  writeJSON(USERS_FILE, users);
  return user;
}

function removeUser(phone) {
  let users = getUsers();
  users = users.filter(u => u.phone !== phone);
  writeJSON(USERS_FILE, users);
}

function isUserAllowed(phone) {
  const users = getUsers();
  const user = users.find(u => u.phone === phone);
  if (!user) return { allowed: false, reason: 'not_found' };
  if (!user.active) return { allowed: false, reason: 'inactive' };
  if (Date.now() > user.expiry) return { allowed: false, reason: 'expired' };
  return { allowed: true };
}

function updateUser(phone, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.phone === phone);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates };
  writeJSON(USERS_FILE, users);
  return true;
}

// Settings
function getSettings() {
  return readJSON(SETTINGS_FILE) || { botMode: 'public', groups: {} };
}

function saveSettings(settings) {
  writeJSON(SETTINGS_FILE, settings);
}

function getGroupSettings(groupId) {
  const settings = getSettings();
  if (!settings.groups[groupId]) {
    settings.groups[groupId] = {
      antilink: false,
      welcome: false,
      goodbye: false
    };
    saveSettings(settings);
  }
  return settings.groups[groupId];
}

function updateGroupSettings(groupId, updates) {
  const settings = getSettings();
  if (!settings.groups[groupId]) settings.groups[groupId] = {};
  settings.groups[groupId] = { ...settings.groups[groupId], ...updates };
  saveSettings(settings);
}

function getBotMode() {
  const s = getSettings();
  return s.botMode || 'public';
}

function setBotMode(mode) {
  const s = getSettings();
  s.botMode = mode;
  saveSettings(s);
}

// Warnings
function getWarnings() {
  return readJSON(WARNINGS_FILE) || {};
}

function addWarning(groupId, userPhone) {
  const warnings = getWarnings();
  const key = `${groupId}:${userPhone}`;
  if (!warnings[key]) warnings[key] = 0;
  warnings[key]++;
  writeJSON(WARNINGS_FILE, warnings);
  return warnings[key];
}

function resetWarnings(groupId, userPhone) {
  const warnings = getWarnings();
  const key = `${groupId}:${userPhone}`;
  warnings[key] = 0;
  writeJSON(WARNINGS_FILE, warnings);
}

function getWarningCount(groupId, userPhone) {
  const warnings = getWarnings();
  const key = `${groupId}:${userPhone}`;
  return warnings[key] || 0;
}

module.exports = {
  getUsers,
  addUser,
  removeUser,
  isUserAllowed,
  updateUser,
  getSettings,
  saveSettings,
  getGroupSettings,
  updateGroupSettings,
  getBotMode,
  setBotMode,
  getWarnings,
  addWarning,
  resetWarnings,
  getWarningCount
};
