const mineflayer = require('mineflayer');
const fs = require('fs');
const config = require('./config.json');

/* ================= LOGGER ================= */
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync('bot.log', line + '\n');
}

/* ============ GLOBAL CRASH HANDLERS ============ */
process.on('uncaughtException', (err) => log(`UNCAUGHT EXCEPTION:\n${err.stack || err}`));
process.on('unhandledRejection', (reason) => log(`UNHANDLED PROMISE REJECTION:\n${reason}`));
process.on('exit', (code) => log(`Process exited with code ${code}`));
process.on('SIGTERM', () => log('Process received SIGTERM'));
process.on('SIGINT', () => log('Process received SIGINT'));

/* ================= BOT LOGIC ================= */
let bot;
let reconnectTimeout = null;

function startBot() {
  log('Starting bot...');

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.account.username,
    password: config.account.password,
    version: config.server.version || false
  });

  bot.once('spawn', () => {
    log('Bot spawned in server');

    // AuthMe login after spawn
    setTimeout(() => {
      if (bot && bot.chat) {
        bot.chat(`/login ${config.account.password}`);
        log('Sent /login command');

        // Start Anti-AFK after delay
        setTimeout(startAntiAfk, config.timings.antiAfkStartDelayMs);
        startChatLoop();
      }
    }, config.timings.authMeDelayMs);
  });

  bot.on('end', () => {
    log('Bot disconnected');
    scheduleReconnect();
  });

  bot.on('kicked', (reason) => log(`Bot kicked: ${reason}`));

  bot.on('error', (err) => log(`Bot error:\n${err.stack || err}`));
}

/* ================= RECONNECT ================= */
function scheduleReconnect() {
  if (reconnectTimeout) return;

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    log('Reconnecting...');
    startBot();
  }, config.timings.reconnectDelayMs);
}

/* ================= ANTI-AFK ================= */
function startAntiAfk() {
  log('Anti-AFK started');

  // Jump
  setInterval(() => {
    if (!bot || !bot.entity) return;

    try {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    } catch (err) {
      log(`Jump error: ${err.message}`);
    }
  }, config.timings.jumpIntervalMs);

  // Look around
  setInterval(() => {
    if (!bot || !bot.entity) return;

    try {
      const yaw = bot.entity.yaw + (Math.random() - 0.5);
      const pitch = bot.entity.pitch;
      bot.look(yaw, pitch, true);
    } catch (err) {
      log(`Look error: ${err.message}`);
    }
  }, config.timings.lookIntervalMs);
}

/* ================= CHAT LOOP ================= */
function startChatLoop() {
  setInterval(() => {
    if (!bot || !bot.chat) return;

    try {
      bot.chat(config.messages.chatMessage);
      log('Sent chat message');
    } catch (err) {
      log(`Chat error: ${err.message}`);
    }
  }, config.timings.chatIntervalMs);
}

/* ================= START BOT ================= */
setTimeout(startBot, config.timings.loginDelayMs);
