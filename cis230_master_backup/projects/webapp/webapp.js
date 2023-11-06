const express = require('express')
const expressHandlebars = require('express-handlebars')
const mariadb = require('mariadb')
const path = require('path')
const axios = require('axios')

const port = process.env.PORT || 3000
const app = express()

app.engine('handlebars', expressHandlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));


// establish a connection to a mariadb database

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'week6user',
    password: 'week6pw',
    connectionLimit: 5
})


app.get('/api_advice', (req, res) => {


    // https://api.adviceslip.com/advice
    // {"slip": { "id": 81, "advice": "Age is of no importance, unless you are a cheese."}}
    axios.get('https://api.adviceslip.com/advice?NAME=EIPP&VAL=10')
    .then(response => {
        //console.log(response)
        console.log(response.data)
        console.log(response.data.slip)

        const obj = response.data.slip
        const lid = obj.id
        const advice = obj.advice
        
        console.log(obj)    // NOTE: same as console.log(response.data.slip)
        console.log(lid)
        console.log(advice)


        json_obj = JSON.stringify(obj)
        res.end(json_obj)
    })
    .catch(error => {
      console.log(error)
    })

})



app.get('/api_nasa', (req, res) => {
    
    axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
    .then(response => {

        console.log(response.data)
        console.log(response.data.url)
        console.log(response.data.explanation)

        res.end(response.data.explanation)

    })
    .catch(error => {
        console.log(error)
    })

})

app.get('/api_dadjokes', async(req, res) => {

    const options = {
      method: 'GET',
      url: 'https://dad-jokes.p.rapidapi.com/random/joke',
      headers: {
        'X-RapidAPI-Key': '08e2971577mshdbbba3e33d8403dp17467bjsn54589f154ad5',
        'X-RapidAPI-Host': 'dad-jokes.p.rapidapi.com'
      }
    }
    
    try {
        const response = await axios.request(options)

        //console.log(response.data);
        //console.log(response.data.body)

        const obj = response.data.body[0]
        const setup = obj.setup
        const punchline = obj.punchline

        //console.log(response.data.body[0].setup)
        //console.log(response.data.body[0].punchline)
        //console.log(setup)
        //console.log(punchline)

        res.type('html')
        res.status(200)
        const msg = '<h3>' + setup + '</h3>' + '<p><p><p>'
            + '<h4>' + punchline + '</h4>'

        // res.end(JSON.stringify(response.data))
        res.end(msg)

    } catch (error) {
        console.error(error);
    }



})



// route to test my database setup
app.get('/test', async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const dbtest = await conn.query('select 1 as val')
        console.log(dbtest)

        res.type('text/plain')
        res.status(200)
        res.send('made it to route: /test')
    } catch(err) {
        console.log(err)
    } finally {
        if (conn) return conn.end();
    }
})

// route to /
app.get('/', (req, res) => {    
    res.render('home', {
        title: 'TGIFF Home',
        name: 'Professor Eipp',
    })
})


// route to /about
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Meadowlark About',
    })
})

// custom 500
app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})


// custom 404
app.use((req, res)=> {
    res.type('text/plain')
    //console.log(res.get('Content-Type'))
    res.status(404)
    res.send('404 - Page Not Found')
})


// start the server listening for requests...
app.listen(port, () => {
    console.log(`Running on http://localhost:${port} ` +
    `Press Ctrl-C to terminate.`)
})