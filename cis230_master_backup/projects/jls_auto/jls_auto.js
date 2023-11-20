/* ASK ABOUT SEMICOLONS */

// Declaring variables for npm nodes, credentials, port, and app.
const express = require('express');
const expressHandlebars = require('express-handlebars');
const mariadb = require('mariadb');
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
// Require config.js
const { credentials } = require('./config')
// Require openid
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
// Set port
const port = process.env.PORT || 8000;
const app = express()

// Use handlebars as the engine.
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

// Setting up cookies
app.use(cookieParser(credentials))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.auto_cookie
}))

/* ASK ABOUT THIS
const config = {
    authReqired: false,
    auth0Logout: true,
    secret: credentials.auto_cookie,
    baseURL: 'http://localhost:8000',
    //PUT CLIENT ID HERE
    clientID: ''
    //PUT ISSUERBASEURL HERE
    issuerBaseURL: ''
};

Auth router attaches /login, /logout, and /callback routes
to the base URL
app.use(auth(config));  */

// Establish a connection to mariaDB
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'week6user',
    password: 'week6pw',
    connectionLimit: 5
})

/*  Route to login
app.get('/login', (req, res) => {
    res.send(req.oidc.isAuthenticaed() ? 'Logged in' : 'Logged out');
});
Route to profile
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

WORK ON THIS WHOLE ROUTE
app.get('/api_metal_price', (req, res) => {
INSERT METAL PRICE API URL
    axios.get('')
}) */



// Route to test my database setup
app.get('/test', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const dbtest = await conn.query('select 1 as val')
        console.log(dbtest)

        //res.type('text/plain')
        //res.status(200)
        //res.send('made it to route: /test')

        res.render('dbtest', {
            title: 'DB Test',
            val: JSON.stringify(dbtest),
        })


    } catch (err) {
        console.log(err)
    } finally {
        if (conn) return conn.end();
    }
})

// Route to /
app.get('/callback', (req,res) => {
    res.send('callback reached')
})

// Route to /
app.get('/', (req, res) => {
    console.log('Cookie Trail has been created')
    res.cookie('scrapcookie',
               'scrapmetal',
               {secure: true, maxAge: 720000}
    )
    res.cookie('signed_scrapcookie',
                'signed scrapmetal',
                {signed: true, secure: true, maxAge: 720000}
                )
    console.log('Cookie Trail completed')

    req.session.username = 'joelindsay'
    req.session.password = 'password'
    const color = req.session.colorScheme || 'dark'
    console.log('Session color: ' + color)

    res.render('home', {
        title: "JL'$ Auto Home",
        name: 'Amanda Dockray',
        isAuthenticated: req.oidc.isAuthenticated()
    })
})

/* FIX THIS!!!!! getting error
"TypeError: Secret string must be provided.
    at exports.sign (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/cookie-signature/index.js:18:40)
    at res.cookie (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/response.js:868:18)
    at /home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/jls_auto.js:108:9
    at Layer.handle [as handle_request] (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/layer.js:95:5)
    at /home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/index.js:346:12)
    at next (/home/dockray/cis230_2023/cis230_2023/cis230_master_backup/projects/jls_auto/node_modules/express/lib/router/index.js:280:10)"
 Route to /cookies
app.get('/cookies', (req, res) => {
    const value = 'scrapcookie: ' + req.cookies.scrapcookie + '<br>'
    const signed_value = 'signed_scrapcookie' + req.signedCookies.signed_scrapcookie + '<br>'
    let values = value + signed_value
    values += req.session.username + ' :: ' + req.session.password
    // Delete cookies
    res.clearCookie('scrapcookie')
    res.clearCookie('signed_scrapcookie')
    // Clear session data
    delete req.session.username
    delete req.session.password

    res.type('html')
    res.end(values)
})
*/

// Route to about
app.get('/about', (req, res) => {
    res.render('about', {
        title: "About JL'$ Auto",
    })
})

// Route to contact
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: "Contact JL'$ Auto",
    });
});

// Route to home
app.get('/home', (req, res) => {
    res.render('home', {
        title: "JL'$ Auto Home",
        name: 'Amanda Dockray',
    });
});

// Route to scrap calculation
/* app.get('/scrapcalc', (req, res) => {
    ADD LOGIC FOR SCRAP CALCULATION
    res.render('scrapcalc', {
        title: "Scrap Calculation",
    });
});

// Route to scrap calculation result
app.post('/scrapresult', (req, res) => {
    ADD LOGIC FOR SCRAP CALULATION RESULT
    res.render('scrapresult', {
        title: "Scrap Result",
        result: ADD RESULT DATA HERE,
    });
}); */


// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});