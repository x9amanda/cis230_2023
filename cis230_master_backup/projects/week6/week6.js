const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const app = express();
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'dockray',
  password: 'reality22',
  database: 'week6db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Route to /
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  res.render('/', {
    title: "JL'$ Auto Home"
  })
})

// Route to /about
app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/about.html')
  res.render('/about', {
    title: "About JL'$ Auto"
  })
})

// Route to /contact
app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/contact.html')
  res.render('/contact', {
    title: "Contact JL'$ Auto"
  })
})

// Route to insert an encrypted password
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

    const selection = await conn.query('select * from t1')
    console.log(selection)

    const json_data = JSON.stringify(rows)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(json_data)

  } catch (err) {
    console.log(err)
  } finally {
    if (conn) return conn.end();
  }

})

app.post('/login', async (req, res) => {
  res.render('/login', {
    title: 'Login',
  })
  const username = req.body.username;
  const password = req.body.password;

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const values = [username, hashedPassword];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error(error);
      res.send('Error verifying login');
    } else {
      if (results.length > 0) {
        res.send('Login successful!');
      } else {
        res.send('Login denied');
      }
    }
  });
});

// custom 500 (server error)
app.use((err, req, res, next) => {
  console.error(err.message)
  res.type('text/plain')
  res.status(500)
  res.send('500 - Server Error')
})

// custom 404 (page not found)
app.use((req, res) => {
  res.type('text/plain')
  res.status(404)
  res.send('404 - Page Not Found')
})

document.addEventListener('DOMContentLoaded', function () {
  const showButton = document.getElementById('showData');
  const hideButton = document.getElementById('hideData');
  const table = document.getElementById('data');

  showButton.addEventListener('click', function () {
    table.style.display = 'block';
  });

  hideButton.addEventListener('click', function () {
    table.style.display = 'none';
  });
});