const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// route to /
app.get('/', (req, res) => {
    res.type('text/plain')
    // or res.set('Content-Type', 'text/plain')
    res.send('Meadowlark Travel')
})

// route to /about
app.get('/about', (req, res) => {
    res.type('text/plain')
    // or res.set('Content-Type', 'text/plain')
    res.send('About Meadowlark Travel')
})

// custom 500 (server error)
app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

// custom 404 (page not found)
app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Page Not Found')
})

//start the server for listening requests
app.listen(port, () => {
    console.log(`meadowlark.js running on http://localhost:${port}.` + 
    ` Press Ctrl-C to terminate.`)
})