const mineflayer = require('mineflayer')
const fs = require('fs')

// keep Replit awake
require('./keepalive')

/* ================= LOAD CONFIG ================= */

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

const BOT_USERNAME = String(config.account.username).trim()
const BOT_PASSWORD = String(config.account.password || '').trim()

if (!BOT_USERNAME) {
  throw new Error('Bot username missing in config.json')
}

console.log('Starting AFK bot as:', BOT_USERNAME)

/* ================= GLOBALS ================= */

let bot = null
let reconnectTimeout = null
let antiAfkInterval = null
let chatInterval = null

/* ================= CREATE BOT ================= */

function createBot() {
  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: BOT_USERNAME,
    version: config.server.version || false
  })

  bot.once('spawn', () => {
    console.log('Bot joined server')

    // AuthMe login
    if (BOT_PASSWORD) {
      setTimeout(() => {
        if (bot) {
          bot.chat(`/login ${BOT_PASSWORD}`)
          console.log('Sent /login')
        }
      }, config.timings.loginDelayMs)
    }

    // start anti-afk after delay
    setTimeout(startAntiAfk, config.timings.antiAfkStartDelayMs)
  })

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('[WARN] ECONNRESET – connection closed by server')
      return
    }
    console.log('[ERROR]', err.message)
  })

  bot.on('kicked', (reason) => {
    console.log('[KICKED]', reason)
    safeReconnect()
  })

  bot.on('end', () => {
    console.log('[END] Disconnected')
    safeReconnect()
  })
}

/* ================= ANTI AFK ================= */

function startAntiAfk() {
  stopAntiAfk()
  console.log('Anti-AFK started')

  antiAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) return

    // jump once
    bot.setControlState('jump', true)
    setTimeout(() => {
      if (bot) bot.setControlState('jump', false)
    }, 500)

    // safe look (no crash)
    try {
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.4
      bot.look(yaw, pitch, true)
    } catch {}
  }, config.timings.jumpIntervalMs)

  // optional chat keep-alive
  if (config.messages?.chatMessage) {
    chatInterval = setInterval(() => {
      if (bot && bot.entity) {
        bot.chat(config.messages.chatMessage)
      }
    }, config.timings.chatIntervalMs)
  }
}

function stopAntiAfk() {
  if (antiAfkInterval) {
    clearInterval(antiAfkInterval)
    antiAfkInterval = null
  }
  if (chatInterval) {
    clearInterval(chatInterval)
    chatInterval = null
  }
}

/* ================= RECONNECT ================= */

function safeReconnect() {
  if (reconnectTimeout) return

  stopAntiAfk()

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null
    console.log('Reconnecting...')
    createBot()
  }, Math.max(config.timings.reconnectDelayMs, 15000))
}

/* ================= START ================= */

createBot()
