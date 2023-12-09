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

// Route to /
app.get('/', (req, res) => {
  console.log('Cookie Trail has been created');

  // Set cookies
  res.cookie('scrapcookie', 'scrapmetal', { secure: true, maxAge: 720000 });
  res.cookie(
    'signed_scrapcookie',
    'signed scrapmetal',
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
app.get('/cookies', (req, res) => {
  const value = 'scrapcookie: ' + req.cookies.scrapcookie + '<br>';
  const signed_value =
    'signed_scrapcookie: ' + req.signedCookies.signed_scrapcookie + '<br>';
  let values = value + signed_value;

  // Append session data
  if (req.session.username && req.session.password) {
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


// Create a connection pool for MariaDB
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'metaluser',
    password: 'metalpw',
    connectionLimit: 5
});

// Route to test the database setup
app.get('/test', async (req, res) => {
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
        console.error(err);
        res.status(500).send('Internal Server Error :(');
    } finally {
        if (conn) return conn.end();
    }
});

// Route to get the price for scrap steel
app.post('/api_metal_price', (req, res) => {
    axios.get('https://metals-api.com/api/latest', {
        params: {
            access_key: '2i4cs0v3a6jn91incwcuy321m2tcd0pzhiujsqmpg1e0etwq2n4so5yc5qek',
            base: 'USD',
            symbols: 'STEEL-SC'
        }
    })
    .then(response => {
        // Extract the price for 'STEEL-SC'
        const steelSCPrice = response.data.rates['STEEL-SC'];

        // Send back the price in the response
        res.json({ steelSCPrice });
    })
    .catch(error => {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    });
});

// Middleware to handle form data
app.use(express.urlencoded({ extended: true }));

// Route to render the form for scrap calculation
app.get('/scrapcalc', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT DISTINCT year, make, model, curb_weight FROM vehicles');
        connection.release();

        // Extract unique values for years, makes, models, and specss
        const years = [...new Set(result.map(vehicle => vehicle.year))];
        const makes = [...new Set(result.map(vehicle => vehicle.make))];
        const models = [...new Set(result.map(vehicle => vehicle.model))];
        const curb_weights = [...new Set(result.map(vehicle => vehicle.curb_weight))];

        res.render('scrapcalc', { years, makes, models, curb_weights});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/scrapresult', async (req, res) => {
    const { year, make, model, curb_weight } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query('USE scrapdb');
        const result = await connection.query('SELECT year, make, model, curb_weight FROM vehicles WHERE year = ? AND make = ? AND model = ?', [year, make, model, curb_weight]);
        connection.release();

        // Check if data is available
        if (result.length > 0) {
            const data = {
                year: result[0].year,
                make: result[0].make,
                model: result[0].model,
                curb_weight: result[0].curb_weight
            };

            // Fetch scrap steel price
            const scrapResponse = await axios.post('/api_metal_price', { year, make, model, curb_weight });

            // Check if the scrapResponse is successful
            if (scrapResponse && scrapResponse.data && scrapResponse.data.steelSCPrice) {
                const steelSCPrice = scrapResponse.data.steelSCPrice;

                // Calculate scrap price based on steel price and curb weight
                const scrapPrice = parseFloat(steelSCPrice) * parseFloat(curb_weight);

                if (!isNaN(scrapPrice)) {
                    // Send the formatted data to the template
                    res.render('scrapresult', {
                        title: "JL'$ Auto Scrap Calculator",
                        data: {
                            year: data.year,
                            make: data.make,
                            model: data.model,
                            curb_weight: data.curb_weight,
                            steelSCPrice: parseFloat(steelSCPrice.toFixed(2)),
                            scrapPrice: parseFloat(scrapPrice.toFixed(2)),
                        },
                        icon: '/images/icon.ico',
                        isAuthenticated: req.oidc.isAuthenticated(),
                    });
                } else {
                    console.error('Invalid scrapPrice calculation:', scrapPrice);
                    res.render('scrapresult', {
                        title: "JL'$ Auto Scrap Calculator",
                        data: null,
                        icon: '/images/icon.ico',
                        isAuthenticated: req.oidc.isAuthenticated()
                    });
                }
            } else {
                console.error('Invalid or missing steelSCPrice in the response:', scrapResponse);
                res.render('scrapresult', {
                    title: "JL'$ Auto Scrap Calculator",
                    data: null,
                    icon: '/images/icon.ico',
                    isAuthenticated: req.oidc.isAuthenticated()
                });
            }
        } else {
            res.render('scrapresult', {
                title: "JL'$ Auto Scrap Calculator",
                data: null,
                icon: '/images/icon.ico',
                isAuthenticated: req.oidc.isAuthenticated()
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to handle callback
app.get('/callback', (req, res) => {
    res.send('callback reached');
});

// Route to render home page
app.get('/', (req, res) => {
    res.render('home', {
        title: "JL'$ Auto Home",
        pdf: '/images/jls_auto_web.pdf',
        icon: '/images/icon.ico',
        isAuthenticated: req.oidc.isAuthenticated()
    });
});

// Route to render login status
app.get('/login', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        // Handle authenticated user
    } else {
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    }
});

// Route to render 'About' page
app.get('/about', requiresAuth(), (req, res) => {
    res.render('about', {
        title: "About JL'$ Auto",
        icon: '/images/icon.ico',
    });
});

// Route to render 'Contact' page
app.get('/contact', requiresAuth(), (req, res) => {
    res.render('contact', {
        title: "Contact JL'$ Auto",
        icon: '/images/icon.ico',
        src: '/images/JLSauto.jpg'
    });
});

// Route to render 'Scrap Calculation' page
app.get('/scrapcalc', requiresAuth(), (req, res) => {
    res.render('scrapcalc', {
        title: "Scrap Calculation",
        icon: '/images/icon.ico',
    });
});

// Error handling middleware for 500 Server Error
app.use((err, req, res, next) => {
    console.error(err.message);
    res.type('text/plain');
    res.status(500);
    res.send('INTERNAL SERVER ERROR :(');
});

// Error handling middleware for 404 Not Found
app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - PAGE NOT FOUND :(');
});

// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});