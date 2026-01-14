const http = require('http');
const https = require('https');
const config = require('./config.json');

const PORT = config.keepalive.port;
const SELF_URL = config.keepalive.selfPingUrl;

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('AFK Bot alive');
}).listen(PORT, () => {
    console.log(`Keepalive server running on port ${PORT}`);
});

setInterval(() => {
    if (!SELF_URL) return;

    https.get(SELF_URL, () => {
        console.log('Self-ping successful');
    }).on('error', (err) => {
        console.log('Self-ping failed:', err.message);
    });
}, config.timings.selfPingIntervalMs);
