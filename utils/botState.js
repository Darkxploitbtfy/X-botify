let botSocket = null;
let botConnected = false;
let adminNumber = null;

function setSocket(sock) {
  botSocket = sock;
}

function getSocket() {
  return botSocket;
}

function setConnected(val) {
  botConnected = val;
}

function isConnected() {
  return botConnected;
}

function setAdminNumber(num) {
  adminNumber = num;
  process.env.ADMIN_NUMBER = num;
}

function getAdminNumber() {
  return adminNumber;
}

module.exports = { setSocket, getSocket, setConnected, isConnected, setAdminNumber, getAdminNumber };
