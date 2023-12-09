const http = require('http')

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-type': 'text/html'} )
    res.end('<br><h1>Hello World!</h1>')
})

server.listen(port, () => console.log('server listening on port 3000. Press ctrl-c to terminate') )