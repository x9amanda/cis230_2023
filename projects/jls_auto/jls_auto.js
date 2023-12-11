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
        const yearsResult = await connection.query('SELECT DISTINCT year FROM vehicles');
        const makesResult = await connection.query('SELECT DISTINCT make FROM vehicles');
        const modelsResult = await connection.query('SELECT DISTINCT model FROM vehicles');

        // Extract unique values for years, makes, and models
        const years = [...new Set(yearsResult.map(vehicle => vehicle.year))];
        const makes = [...new Set(makesResult.map(vehicle => vehicle.make))];
        const models = [...new Set(modelsResult.map(vehicle => vehicle.model))];

        res.render('scrapcalc', { title: 'Scrap Calculation', years, makes, models });
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

// Route to handle form submission and redirect to /scrapresult
app.post('/scrapcalc', isAuthenticated, async (req, res, next) => {
    const { year, make, model } = req.body;

    // Fetch curb_weight based on year, make, and model from the database
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT curb_weight FROM vehicles WHERE year=? AND make=? AND model=?', [year, make, model]);

        // Extract curb_weight
        const curb_weight = result[0].curb_weight;

        // Redirect to /scrapresult with the selected data
        res.redirect(`/scrapresult?year=${year}&make=${make}&model=${model}&curb_weight=${curb_weight}`);
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

// Route to render the scrap result page
app.get('/scrapresult', isAuthenticated, async (req, res, next) => {
    // Retrieve data from query parameters
    const { year, make, model, curb_weight } = req.query;

    // Fetch current scrap steel price from the API
    const METALS_API_KEY = '2i4cs0v3a6jn91incwcuy321m2tcd0pzhiujsqmpg1e0etwq2n4so5yc5qek';
    try {
        const metalResponse = await axios.get('https://metals-api.com/api/latest', {
            params: {
                access_key: METALS_API_KEY,
                base: 'USD',
                symbols: 'STEEL-SC'
            }
        });

        const currentScrapPrice = metalResponse.data.rates['STEEL-SC'];

        // Calculate vehicle scrap price
        const vehicleScrapPrice = curb_weight * currentScrapPrice;

        res.render('scrapresult', {
            title: 'Scrap Result',
            data: { year, make, model, curb_weight, scrapPrice: currentScrapPrice, vehicleScrapPrice }
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: 'INTERNAL SERVER ERROR :(' });
    }
});

// Route to get makes based on the selected year
app.get('/getMakes', isAuthenticated, async (req, res, next) => {
    const { year } = req.query;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT DISTINCT make FROM vehicles WHERE year=?', [year]);

        const makes = result.map(vehicle => vehicle.make);
        res.json(makes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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

// Route to get models based on the selected year and make
app.get('/getModels', isAuthenticated, async (req, res, next) => {
    const { year, make } = req.query;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT DISTINCT model FROM vehicles WHERE year=? AND make=?', [year, make]);

        const models = result.map(vehicle => vehicle.model);
        res.json(models);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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

});// Route to render 'Contact' page
app.get('/contact', isAuthenticated, requiresAuth(), (req, res) => {
    res.render('contact', {
        title: "Contact JL'$ Auto",
        icon: '/images/icon.ico',
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});