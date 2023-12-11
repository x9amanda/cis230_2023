// Declaring variables for npm nodes, credentials config, port, and app.
const express = require('express');
const expressHandlebars = require('express-handlebars');
const mariadb = require('mariadb');
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { credentials } = require('./config');

const port = process.env.PORT || 3000;
const app = express();

// Configure handlebars as the view engine
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

// Configure authentication with Auth0
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: credentials.auto_cookie,
    baseURL: 'http://localhost:3000',
    clientID: 'MkCVhli3qNmw4jbJguk1yt0FmEMWp9o0',
    issuerBaseURL: 'https://dev-gict4zuzq4u3u73g.us.auth0.com'
};

app.use(auth(config));

// Setting up cookies and sessions
app.use(cookieParser(credentials.auto_cookie));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: credentials.auto_cookie,
    })
);

// Middleware to handle form data
app.use(express.urlencoded({ extended: true }));

// Create a connection pool for MariaDB
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'metaluser',
    password: 'metalpw',
    connectionLimit: 5
});

// Centralized authentication check middleware
const isAuthenticated = (req, res, next) => {
    if (req.oidc.isAuthenticated()) {
        next();
    } else {
        res.send('Not authenticated');
    }
};

// Route to /
app.get('/', requiresAuth(), (req, res) => {
    console.log('Cookie Trail has been created');

    // Set cookies
    res.cookie('scrapcookie', 'scrapmetal', { secure: true, maxAge: 720000 });
    res.cookie(
        'signed_scrapcookie',
        'signed_scrapmetal',
        { signed: true, secure: true, maxAge: 720000 }
    );
    console.log('Cookie Trail completed');

    // Set session data
    req.session.username = 'joelindsay';
    req.session.password = 'password';
    const color = req.session.colorScheme || 'dark';
    console.log('Session color: ' + color);

    res.render('home', {
        title: "JL'$ Auto Home",
        pdf: '/images/jls_auto_web.pdf',
        icon: '/images/icon.ico',
        isAuthenticated: req.oidc.isAuthenticated(),
    });
});

// Route to /cookies
app.get('/cookies', isAuthenticated, (req, res) => {
    const value = 'scrapcookie: ' + req.cookies.scrapcookie + '<br>';
    const signed_value =
        'signed_scrapcookie: ' + req.signedCookies.signed_scrapcookie + '<br>';
    let values = value + signed_value;

    // Append session data
    if (req.session && req.session.username && req.session.password) {
        values +=
            'Session Data: ' +
            req.session.username +
            ' :: ' +
            req.session.password +
            '<br>';
    }

    // Delete cookies
    res.clearCookie('scrapcookie');
    res.clearCookie('signed_scrapcookie');

    // Clear session data
    req.session.destroy();

    res.type('html');
    res.end(values);
});

// Route to test the database setup
app.get('/test', isAuthenticated, async (req, res, next) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const dbtest = await conn.query('select 1 as val');
        console.log(dbtest);

        res.render('dbtest', {
            title: 'DB Test',
            val: JSON.stringify(dbtest),
        });

    } catch (err) {
        console.error(error);
        res.status(500).render('error', { title: 'INTERNAL SERVER ERROR :(' });
    } finally {
        if (conn) {
            try {
                await conn.end();
            } catch (error) {
                console.error(err);
                res.status(500).render('error', { title: 'INTERNAL SERVER ERROR :(' });            }
        }
    }
});

// Route to render the form for scrap calculation
app.get('/scrapcalc', isAuthenticated, async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT DISTINCT year, make, model, curb_weight FROM vehicles');

        // Extract unique values for years, makes, models, and curb weights
        const years = [...new Set(result.map(vehicle => vehicle.year))];
        const makes = [...new Set(result.map(vehicle => vehicle.make))];
        const models = [...new Set(result.map(vehicle => vehicle.model))];
        const curb_weights = [...new Set(result.map(vehicle => vehicle.curb_weight))];

        res.render('scrapcalc', { years, makes, models, curb_weights });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: 'INTERNAL SERVER ERROR :(' });
    } finally {
        if (connection) {
            try {
                connection.release();
            } catch (releaseError) {
                next(releaseError);
            }
        }
    }
});

// Route to display the scrap results in a table
app.post('/scrapresult', isAuthenticated, async (req, res, next) => {
    const { year, make, model, curb_weight } = req.body;

    try {
        // Fetch metal data
        const metalResponse = await axios.get('https://metals-api.com/api/latest', {
            params: {
                access_key: '2i4cs0v3a6jn91incwcuy321m2tcd0pzhiujsqmpg1e0etwq2n4so5yc5qek',
                base: 'USD',
                symbols: 'STEEL-SC'
            }
        });

        // Extract the scrap steel price from the metal data
        const scrapPrice = metalResponse.data.rates['STEEL-SC'];

        // Validate and process the data
        if (!year || !make || !model || isNaN(parseFloat(curb_weight))) {
            return res.status(400).json({ success: false, message: 'Invalid input data.' });
        }        

        // Render the scrapresult handlebars template with the data
        res.render('scrapresult', {
            title: "JL'$ Auto Scrap Calculator",
            data: {
                year,
                make,
                model,
                curb_weight,
                scrapPrice: parseFloat(scrapPrice * curb_weight).toFixed(2),
            },
            icon: '/images/icon.ico',
            isAuthenticated: req.oidc.isAuthenticated(),
        });

        res.json({ success: true, message: 'Scrap result received successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: 'INTERNAL SERVER ERROR :(' });
    }
});


// Route to handle callback
app.get('/callback', isAuthenticated, (req, res) => {
    res.send('callback reached');
});

// Route to render 'About' page
app.get('/about', isAuthenticated, requiresAuth(), (req, res) => {
    res.render('about', {
        title: "About JL'$ Auto",
        icon: '/images/icon.ico',
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});