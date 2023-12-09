const express = require('express')

const dt = require('./myfirstmodule')

const app = express()

const port = process.env.PORT || 3000

// build a route to /
app.get('/', (req, res) => {

    // res.writeHead(200, {'Content-Type' : 'text/html'})

    res.send('The date and time is currently:<br /> ' + 
    dt.myDateTime() +
    '<br /><br />myDateTime2 is:<br /> ' +
    dt.myDateTime2())

})

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})


// route to foo
app.get('/foo', (req, res) => {
    res.send("<h1>hello from foo!</h1>")
})

// route to bar
app.get('/bar', (req, res) => {
    res.send("<h2>hello from bar!</h2>")
})