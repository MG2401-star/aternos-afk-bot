const mineflayer = require('mineflayer');
const fs = require('fs');
const fetch = require('node-fetch'); // npm i node-fetch
const config = require('./config.json');

// Utility to log messages with timestamp
function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}`;
    console.log(line);
    fs.appendFileSync('bot.log', line + '\n');
}

// Start bot function
function startBot() {
    let bot;
    try {
        bot = mineflayer.createBot({
            host: config.server.host,
            port: config.server.port,
            username: config.account.username,
            password: config.account.password,
            version: config.server.version || false
        });

        log('Bot joined server');

        // Anti-AFK: jump and look around
        setTimeout(() => {
            setInterval(() => {
                try {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 100);
                    bot.look(Math.random() * 2 * Math.PI, 0, true);
                } catch (err) {
                    log('Anti-AFK error: ' + err.message);
                }
            }, config.timings.jumpIntervalMs);
        }, config.timings.antiAfkStartDelayMs);

        // Chat periodically
        setInterval(() => {
            try {
                bot.chat(config.messages.chatMessage);
            } catch (err) {
                log('Chat error: ' + err.message);
            }
        }, config.timings.chatIntervalMs);

        // Reconnect handlers
        bot.on('kicked', (reason) => {
            log('Kicked: ' + reason);
            reconnectBot();
        });

        bot.on('end', (reason) => {
            log('Disconnected: ' + reason);
            reconnectBot();
        });

        bot.on('error', (err) => {
            log('Bot error: ' + err.message);
            reconnectBot();
        });

    } catch (err) {
        log('Failed to start bot: ' + err.message);
        reconnectBot();
    }

    function reconnectBot() {
        setTimeout(() => {
            log('Reconnecting bot...');
            startBot();
        }, config.timings.reconnectDelayMs);
    }
}

// Start the bot
startBot();

// Self-ping to keep Replit awake
const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/`;

setInterval(async () => {
    try {
        await fetch(url);
        log('Self-ping sent');
    } catch (err) {
        log('Self-ping failed: ' + err.message);
    }
}, 180000); // every 3 minutes
