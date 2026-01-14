const mineflayer = require('mineflayer');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));

let bot = null;
let isSpawned = false;
let antiAfkInterval = null;
let reconnectTimeout = null;

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync('bot.log', line + '\n');
}

function createBot() {
    if (bot) return;

    log('Creating bot...');

    bot = mineflayer.createBot({
        host: config.server.host,
        port: config.server.port,
        username: config.account.username,
        password: config.account.password,
        version: config.server.version
    });

    bot.once('spawn', () => {
        isSpawned = true;
        log('Bot spawned');

        setTimeout(startAntiAfk, config.timings.antiAfkStartDelayMs);
    });

    bot.on('end', (reason) => {
        log(`Disconnected: ${reason}`);
        cleanupBot();
        scheduleReconnect();
    });

    bot.on('error', (err) => {
        log(`Error: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        log(`Kicked: ${reason}`);
    });
}

function startAntiAfk() {
    if (antiAfkInterval || !isSpawned || !bot?.entity) return;

    log('Anti-AFK started');

    antiAfkInterval = setInterval(() => {
        if (!bot || !isSpawned || !bot.entity) return;

        try {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 300);

            const yaw = bot.entity.yaw + (Math.random() - 0.5);
            bot.look(yaw, bot.entity.pitch, true);

            bot.chat(config.messages.chatMessage);
        } catch (e) {
            log(`Anti-AFK skipped: ${e.message}`);
        }
    }, config.timings.antiAfkIntervalMs);
}

function stopAntiAfk() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
        log('Anti-AFK stopped');
    }
}

function cleanupBot() {
    stopAntiAfk();
    isSpawned = false;
    bot = null;
}

function scheduleReconnect() {
    if (reconnectTimeout) return;

    log('Reconnecting soon...');
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        createBot();
    }, config.timings.reconnectDelayMs);
}

/* START */
setTimeout(createBot, config.timings.loginDelayMs);
