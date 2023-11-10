const express = require('express');
const expressHandlebars = require('express-handlebars');
const mariadb = require('mariadb');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

const port = process.env.PORT || 8000;
const app = express();

app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'week6user',
    password: 'week6pw',
    connectionLimit: 5
});

const METALS_API_KEY = 'YOUR_METALS_API_KEY';

// Read the CSV file and store the gross vehicle weights
const vehicleWeights = [];

fs.createReadStream('path/to/vehicle_weights.csv')
    .pipe(csv())
    .on('data', (row) => {
        vehicleWeights.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed.');
    });

// Route to get scrap steel prices from metals-api based on gross vehicle weight
app.get('/getMetalPrice/:year/:make/:model', async (req, res) => {
    try {
        const year = req.params.year;
        const make = req.params.make;
        const model = req.params.model;

        // Find the corresponding gross vehicle weight based on the selected year, make, and model
        const selectedVehicle = vehicleWeights.find(vehicle => 
            vehicle.Year === year && vehicle.Make === make && vehicle.Model === model);

        if (!selectedVehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const grossVehicleWeight = selectedVehicle.GrossWeight;

        // Fetch the metal price from metals-api
        const response = await axios.get('https://metals-api.com/api/latest', {
            params: {
                access_key: METALS_API_KEY,
                base: 'USD',
                symbols: 'STEEL-SC',
            },
        });

        // Extract metal price from the response
        const metalPrice = response.data.rates['STEEL-SC'];

        // Use the grossVehicleWeight to calculate the scrap metal price

        res.json({ metalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to test my database setup
app.get('/test', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const dbtest = await conn.query('select 1 as val');
        console.log(dbtest);

        res.type('text/plain');
        res.status(200);
        res.send('made it to route: /test');
    } catch (err) {
        console.log(err);
    } finally {
        if (conn) return conn.end();
    }
});

app.get('/', (req, res) => {
    res.render('home', {
        title: "JL'$ Auto Home",
        name: 'Amanda Dockray',
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: "About JL'$ Auto",
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: "Contact JL'$ Auto",
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: "Login to JL'$ Auto",
    });
});

app.get('/scrapcalc', (req, res) => {
    // Add logic for scrap calculation page
    res.render('scrapcalc', {
        title: "Scrap Calculation",
    });
});

app.post('/scrapresult', (req, res) => {
    // Add logic to handle scrap calculation result
    res.render('scrapresult', {
        title: "Scrap Result",
        result: /* result data */,
    });
});

app.get('/home', (req, res) => {
    res.render('home', {
        title: "JL'$ Auto Home",
        name: 'Amanda Dockray',
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}. Press Ctrl-C to terminate.`);
});
