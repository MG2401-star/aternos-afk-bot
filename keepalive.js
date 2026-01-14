const http = require('http');
const port = 3000;

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('AFK bot alive');
}).listen(port, () => console.log(`Web server listening on port ${port}`));
