const mineflayer = require('mineflayer')

const config = {
    host: "PaddaakS2Lifesteal.aternos.me",
    port: 16666,
    username: "MG_24BOT",
    password: "bot@12345"      // AuthMe password
}

let bot

function startBot() {
    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        onlineMode: false
    })

    bot.once("spawn", () => {
        console.log("Bot joined server")

        // Wait for AuthMe system to be ready
        setTimeout(() => {
            bot.chat(`/login ${config.password}`)
        }, 5000)

        // Start Anti-AFK only AFTER login
        setTimeout(() => {
            startAntiAFK()
        }, 8000)
    })

    // Detect AuthMe messages
    bot.on("messagestr", msg => {
        msg = msg.toLowerCase()

        if (msg.includes("register")) {
            bot.chat(`/register ${config.password} ${config.password}`)
        }

        if (msg.includes("login")) {
            bot.chat(`/login ${config.password}`)
        }
    })

    // Auto-reconnect
    bot.on("end", () => {
        console.log("Disconnected. Reconnecting...")
        setTimeout(startBot, 5000)
    })

    bot.on("kicked", () => {
        console.log("Kicked. Reconnecting...")
        setTimeout(startBot, 5000)
    })

    bot.on("error", () => {})
}

// Anti-AFK system
function startAntiAFK() {
    console.log("Anti-AFK started")

    // Jump every 30 seconds
    setInterval(() => {
        bot.setControlState("jump", true)
        setTimeout(() => bot.setControlState("jump", false), 400)
    }, 30000)

    // Look around every 15 seconds
    setInterval(() => {
        bot.look(Math.random() * Math.PI * 2, 0)
    }, 15000)

    // Chat every 4 minutes
    setInterval(() => {
        bot.chat("Anti-AFK is operational")
    }, 240000)
}

startBot()
