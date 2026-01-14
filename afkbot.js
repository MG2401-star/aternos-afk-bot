const mineflayer = require('mineflayer')
const fs = require('fs')

/* ================= LOAD CONFIG ================= */

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

const BOT_USERNAME = String(config.account.username).trim()
const BOT_PASSWORD = String(config.account.password || '').trim()

if (!BOT_USERNAME) {
  throw new Error('Bot username missing in config.json')
}

console.log('Starting AFK bot as:', BOT_USERNAME)

/* ================= BOT CREATION ================= */

let bot
let reconnectTimeout = null
let antiAfkInterval = null
let chatInterval = null

function createBot() {
  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: BOT_USERNAME,
    version: config.server.version || false
  })

  /* ================= EVENTS ================= */

  bot.once('spawn', () => {
    console.log('Bot joined server')

    // AuthMe login
    if (BOT_PASSWORD) {
      setTimeout(() => {
        bot.chat(`/login ${BOT_PASSWORD}`)
        console.log('Sent /login')
      }, config.timings.loginDelayMs)
    }

    // Start Anti-AFK AFTER spawn
    setTimeout(startAntiAfk, config.timings.antiAfkStartDelayMs)
  })

  bot.on('end', handleDisconnect)
  bot.on('kicked', handleDisconnect)

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('Connection reset. Reconnecting...')
    } else {
      console.log('Bot error:', err.message)
    }
  })
}

/* ================= ANTI-AFK ================= */

function startAntiAfk() {
  stopAntiAfk()

  console.log('Anti-AFK started')

  antiAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) return

    // Jump
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 500)

    // Look safely (NO physics crash)
    try {
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.5
      bot.look(yaw, pitch, true)
    } catch {}
  }, config.timings.jumpIntervalMs)

  // Optional chat ping
  if (config.messages?.chatMessage) {
    chatInterval = setInterval(() => {
      if (bot && bot.entity) {
        bot.chat(config.messages.chatMessage)
      }
    }, config.timings.chatIntervalMs)
  }
}

function stopAntiAfk() {
  if (antiAfkInterval) clearInterval(antiAfkInterval)
  if (chatInterval) clearInterval(chatInterval)
}

/* ================= RECONNECT ================= */

function handleDisconnect() {
  console.log('Disconnected. Reconnecting...')

  stopAntiAfk()

  if (reconnectTimeout) return

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null
    createBot()
  }, config.timings.reconnectDelayMs)
}

/* ================= START ================= */

createBot()
