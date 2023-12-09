const express = require('express')
const expressHandlebars = require('express-handlebars')
const path = require('path');
const port = process.env.PORT || 3000

const app = express()
app.engine('handlebars', expressHandlebars.engine())
app.set('view engine', 'handlebars')
//app.set('views', './views')
app.set('views', path.join(__dirname, 'views'));


/*
You should create the public directory and in the server,
you can serve static files such as images, fonts, CSS files,
and JavaScript files, use the express.static built-in middleware
function in Express.
*/
// npm install path
// see:
// https://stackoverflow.com/questions/62147032/handlebars-not-loading-local-css-file



app.use(express.static(path.join(__dirname, 'public')));



// establish a connection to a mariadb database
const mariadb = require('mariadb')
const pool = mariadb.createPool({
host: 'localhost',
user: 'week6user',
password: 'week6pw',
connectionLimit: 5
})


// route to test my database setup
app.get('/test', async(req, res) => {

let conn;

try {

conn = await pool.getConnection();

//const dbtest = await conn.query('select 1 as val')
//console.log(dbtest)

// user nodedb
// insert into to t any number
// select * from t
const usenodedb = await conn.query('use week6db')
let rand = Math.random() * 100;
const inrows = await conn.query('insert into t values (?)', [rand])

const rows = await conn.query('select x, x as y from t')
console.log(rows)

res.render('showdata', {
title: 'Data Results',
data: rows,
isDeleted: false,
})


//const json_data = JSON.stringify(rows)
//res.writeHead(200, {'Content-Type': 'application/json'})
//res.end(json_data)


} catch(err) {
console.log(err)
} finally {
if (conn) return conn.end();
}




})






// build a route to /delete and have this delete all data in t
// route to test my database setup
app.get('/delete', async(req, res) => {
let conn;
try {
conn = await pool.getConnection();
const week6db = await conn.query('use week6db')
const delete_data = await conn.query('delete from t')
console.log(delete_data)

res.render('showdata', {
title: 'Deleted Page',
isDeleted: true,
table_name: 't',
})
} catch(err) {
console.log(err)
} finally {
if (conn) return conn.end();
}

})



















// route to /
app.get('/', (req, res) => {
res.render('home', {
title: 'Meadowlark Home',
name: 'Billy Eipp',
age: 5,
data_x: 'my custom data from my secret database...',
})
})


// route to /about
app.get('/about', (req, res) => {
res.render('about', {
title: 'Meadowlark About',
dev_name: 'Pro Staff Development',
showDevName: false,
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
//res.set('Content-Type', 'text/plain')
res.type('text/plain')

console.log(res.get('Content-Type'))



/*
res.set({
'Content-Type': 'text/html',
'Content-Lenght': '123',
'obj': '12345',
})

res.type('html') // 'text/html
res.type('json') // 'application/json
res.type('jpeg') // 'image/jpeg
res.type('png') // 'image/png'
*/

res.status(404)
res.send('404 - Page Not Found')
})


// start the server listening for requests...
app.listen(port, () => {
console.log(`Running on http://localhost:${port} ` +
`Press Ctrl-C to terminate.`)
})