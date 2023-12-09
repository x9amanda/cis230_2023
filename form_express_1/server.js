const express = require('express')
const mariadb = require('mariadb')
const crypto = require('crypto')

const app = express()
const port = process.env.PORT || 3000

// Establish a connection to the database
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'week6user',
    password: 'week6pw',
    connectionLimit: 5
})

// built in URL handler
app.use(
    express.urlencoded({
        extended: true,
    })
)

// landing route to /
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// route to /find
app.post('/find', async (req, res) => {

    // get the data posted up to the server
    const search_text = await req.body.searchString
    console.log(search_text)
    res.send(`I will now search for this item on the back end server: ${search_text}`)
})


// route to insert an encrypted password
app.post('/insert', async (req, res) => {

    // get the data posted up to the server
    const username = await req.body.username
    const pw = await req.body.userpw

    console.log(username)
    console.log(pw)

    const hash = crypto.createHash('sha256').update(pw).digest('hex')
    console.log(hash)

    let conn;
    try {
        conn = await pool.getConnection();
        const week6db = await conn.query('use week6db')

        let rand = Math.random() * 100
        console.log(week6db)

        const inrows = await conn.query('insert into t1 values (?,?)', [username, hash])
        console.log(inrows)

        const rows = await conn.query('select * from t1')
        console.log(rows)

        const json_data = JSON.stringify(rows)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(json_data)
        
    } catch (err) {
        console.log(err)
    } finally {
        if (conn) return conn.end();
    }

})

// start the server
app.listen(port, () => {
    console.log(`server.js is listening on port ${port}`)
})