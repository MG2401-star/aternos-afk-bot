require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('./config.json');

/* ================= ENV HELPER ================= */
const ENV = (key, fallback) =>
  process.env[key] !== undefined ? process.env[key] : fallback;

/* ================= LOGGER ================= */
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync('bot.log', line + '\n');
}

/* ================= WEB SERVER ================= */
const PORT = ENV('KEEPALIVE_PORT', config.keepalive.port || 3000);

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AFK Bot alive\n');
}).listen(PORT, () => {
  log(`Keepalive server running on port ${PORT}`);
});

/* ================= SELF PING ================= */
const SELF_PING_URL = ENV(
  'SELF_PING_URL',
  config.keepalive.selfPingUrl
);

const PING_INTERVAL =
  config.timings.selfPingIntervalMs || 180000;

if (SELF_PING_URL) {
  setInterval(() => {
    https
      .get(SELF_PING_URL, res => {
        log(`Self-ping successful (status ${res.statusCode})`);
      })
      .on('error', err => {
        log(`Self-ping failed: ${err.message}`);
      });
  }, PING_INTERVAL);

  log(`Self-ping enabled every ${PING_INTERVAL / 1000}s`);
} else {
  log('Self-ping disabled (no SELF_PING_URL set)');
}
