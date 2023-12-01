// Declaring variables for npm nodes, credentials config, port, and app.
const express = require('express');
const expressHandlebars = require('express-handlebars');
const mariadb = require('mariadb');
const path = require('path');
const axios = require('axios');
// const cookieParser = require('cookie-parser');
// const expressSession = require('express-session');
const { credentials } = require('./config');
// Require openid
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
// Set port
const port = process.env.PORT || 3000;
const app = express();

// Use handlebars as the engine.
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

// // Setting up cookies (Don't need for this assignment)
// app.use(cookieParser(credentials))
// app.use(expressSession({
//     resave: false,
//     saveUninitialized: false,
//     secret: credentials.auto_cookie
// }))

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: credentials.auto_cookie,
    baseURL: 'http://localhost:3000',
    clientID: 'MkCVhli3qNmw4jbJguk1yt0FmEMWp9o0',
    issuerBaseURL: 'https://dev-gict4zuzq4u3u73g.us.auth0.com'
};

// Auth router attaches /login, /logout, and /callback routes
// to the base URL
app.use(auth(config));

// Establish a connection to mariaDB
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'metaluser',
    password: 'metalpw',
    connectionLimit: 5
})

// // WORK ON THIS WHOLE ROUTE
// app.get('/api_metal_price', (req, res) => {
// INSERT METAL PRICE API URL
//     axios.get('https://metals-api.com/api/latest
//                ? access_key = *****API_KEY*****
//                & base = USD
//                & symbols = STEEL-SC')
// })



// Route to test my database setup
app.get('/test', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const dbtest = await conn.query('select 1 as val');
        console.log(dbtest);

        //res.type('text/plain')
        //res.status(200)
        //res.send('made it to route: /test')

        res.render('dbtest', {
            title: 'DB Test',
            val: JSON.stringify(dbtest),
        });


    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) return conn.end();
    }
});

// Route to /
app.get('/callback', (req,res) => {
    res.send('callback reached')
})

// Route to /
app.get('/', (req, res) => {
    // console.log('Cookie Trail has been created')
    // res.cookie('scrapcookie',
    //            'scrapmetal',
    //            {secure: true, maxAge: 720000}
    // )
    // res.cookie('signed_scrapcookie',
    //             'signed scrapmetal',
    //             {signed: true, secure: true, maxAge: 720000}
    //             )
    // console.log('Cookie Trail completed')

    // req.session.username = 'joelindsay'
    // req.session.password = 'password'
    // const color = req.session.colorScheme || 'dark'
    // console.log('Session color: ' + color)

    res.render('home', {
        title: "JL'$ Auto Home",
        pdf: '/images/jls_auto_web.pdf',
        icon: '/images/icon.ico',
        isAuthenticated: req.oidc.isAuthenticated()
    });
});

// // FIX THIS
// // req.isAuthenticated is provided from the auth router
app.get('/login', (req, res) => {
    if (req.oidc.isAuthenticated()) {

    } else {
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    }
    
});

// FIX THIS!!!!! getting error
//  Route to /cookies
// app.get('/cookies', (req, res) => {
//     const value = 'scrapcookie: ' + req.cookies.scrapcookie + '<br>'
//     const signed_value = 'signed_scrapcookie' + req.signedCookies.signed_scrapcookie + '<br>'
//     let values = value + signed_value
//     values += req.session.username + ' :: ' + req.session.password
//     // Delete cookies
//     res.clearCookie('scrapcookie')
//     res.clearCookie('signed_scrapcookie')
//     // Clear session data
//     delete req.session.username
//     delete req.session.password

//     res.type('html')
//     res.end(values)
// })

// Route to about
app.get('/about', requiresAuth(), (req, res) => {
    res.render('about', {
        title: "About JL'$ Auto",
        icon: '/images/icon.ico',
    })
})

// Route to contact
app.get('/contact', requiresAuth(), (req, res) => {
    res.render('contact', {
        title: "Contact JL'$ Auto",
        icon: '/images/icon.ico',
        src: '/images/JLSauto.jpg'
    });
});

// Route to scrap calculation
app.get('/scrapcalc', requiresAuth(), (req, res) => {
    res.render('scrapcalc', {
        title: "Scrap Calculation",
        icon: '/images/icon.ico',
    });
});

// // Route to scrap calculation result
// app.post('/scrapresult', requiresAuth(), (req, res) => {
//     ADD LOGIC FOR SCRAP CALULATION RESULT
//     res.render('scrapresult', {
//         title: "Scrap Result",
//         icon: '/images/icon.ico',
//         result: ADD RESULT DATA HERE,
//     });
// });

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


// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});