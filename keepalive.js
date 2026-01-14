const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('./config.json');

/* ================= LOGGER ================= */
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync('bot.log', line + '\n'); // logs to same bot.log
}

/* ================= WEB SERVER ================= */
const PORT = config.keepalive.port || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AFK Bot alive\n');
}).listen(PORT, () => {
  log(`Keepalive server running on port ${PORT}`);
});

/* ================= SELF PING ================= */
const SELF_URL = config.keepalive.selfPingUrl;

if (SELF_URL) {
  setInterval(() => {
    https.get(SELF_URL, () => {
      log('Self-ping successful');
    }).on('error', (err) => {
      log(`Self-ping failed: ${err.message}`);
    });
  }, config.timings.selfPingIntervalMs || 180000); // default 3 minutes
} else {
  log('Self-ping URL not set in config');
}
