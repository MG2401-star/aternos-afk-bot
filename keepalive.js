const http = require('http')

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('AFK bot alive')
}).listen(3000)
