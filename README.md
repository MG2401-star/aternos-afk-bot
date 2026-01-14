## Best Aternos AFK Bot (with login and Anti-AFK!)

This is a pretty straight forward bot.
You can use it to keep your free minecraft servers online 24/7.

I reccomend using replit to clone the repo and run the files (afkbot.js and keepalive.js) using a workflow
<pre>node afkbot.js</pre>
<pre>node keepalive.js</pre>

# Local Installation (git bash)
<pre>git clone https://github.com/MG2401-star/aternos-afk-bot</pre>
<pre>cd aternos-afk-bot</pre>
<pre>npm install</pre>

To run the bot:
<pre>node afkbot.js & node keepalive.js</pre>

## Configure the config file to suit your needs
 - Change Server Adress to your adress (without port, eg. abc.aternos.me)
 - and set port to server port. (eg. 16666)
 - username should be set to bot name
 - password to AuthMe / login system password

## Only limitation is you will have to use admin on your minecraft server to register the bot with the password in the config file.
For AuthMe users, command looks like:
/authme reg <your_bot_username> <password_from_config>

## Dependencies:
- Nodejs
- npm
- mineflayer 

Please note:
Usable only on cracked servers, this can get you banned on aternos.
