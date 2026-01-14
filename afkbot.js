const mineflayer = require('mineflayer');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));

let bot = null;
let isSpawned = false;

let antiAfkInterval = null;
let chatInterval = null;
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

        // ⏳ AuthMe login AFTER spawn
        setTimeout(() => {
            if (!bot) return;

            bot.chat(`/login ${config.account.password}`);
            log('AuthMe login command sent');

            // ⏳ Start Anti-AFK AFTER login
            setTimeout(() => {
                startAntiAfk();
                startChat();
            }, config.timings.antiAfkStartDelayMs);

        }, config.timings.authMeDelayMs);
    });

    bot.on('end', (reason) => {
        log(`Disconnected: ${reason}`);
        cleanupBot();
        scheduleReconnect();
    });

    bot.on('kicked', (reason) => {
        log(`Kicked: ${reason}`);
    });

    bot.on('error', (err) => {
        log(`Error: ${err.message}`);
    });
}

function startAntiAfk() {
    if (antiAfkInterval || !isSpawned || !bot?.entity) return;

    log('Anti-AFK started');

    antiAfkInterval = setInterval(() => {
        if (!bot || !isSpawned || !bot.entity) return;

        try {
            // Jump
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 300);

            // Small look movement (yaw-safe)
            const yaw = bot.entity.yaw + (Math.random() - 0.5);
            bot.look(yaw, bot.entity.pitch, true);

        } catch (e) {
            log(`Anti-AFK skipped: ${e.message}`);
        }
    }, config.timings.antiAfkIntervalMs);
}

function startChat() {
    if (chatInterval) return;

    log('Chat timer started');

    chatInterval = setInterval(() => {
        if (!bot || !isSpawned) return;
        bot.chat(config.messages.chatMessage);
    }, config.timings.chatIntervalMs);
}

function stopIntervals() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
    if (chatInterval) {
        clearInterval(chatInterval);
        chatInterval = null;
    }
}

function cleanupBot() {
    stopIntervals();
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

/* 🚀 START BOT */
setTimeout(createBot, config.timings.loginDelayMs);
