require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');
const { log } = require('console');


const app = express();


//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')))



const generateShortUrl = (longUrl) => {
    const hash = crypto.createHash('md5');
    hash.update(longUrl);
    return hash.digest('hex').slice(0, 5);
}


let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected to database as id ' + connection.threadId);
});




app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'index.html'))

})

app.post('/shortenUrl', (req, res) => {
    const { longUrl, username } = req.body;
    const shortUrl = generateShortUrl(longUrl);
    const data = [longUrl, shortUrl, username];

    const query = `INSERT INTO urls (longUrl, shortUrl,username) VALUES (? , ?, ?)`;
    connection.query(query, data, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(500).json({ error: 'Internal server error' });

        }
        res.status(200).json({ message: `Your short url is http://localhost:3000/${shortUrl}` });
    });
});

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const query = `SELECT longUrl FROM urls WHERE shortUrl = ?`;
    try {
        const rows = await new Promise((resolve, reject) => {
            connection.query(query, [shortUrl], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
        if (rows.length === 0) {
            res.status(404).send('Short URL not found');
            return;
        }

        const longUrl = rows[0].longUrl;

        res.send(`
            <script>
                window.open("${longUrl}", "_blank");
            </script>
        `);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/history/:username', (req, res) => {
    let username = req.params.username;
    const query = `SELECT * FROM urls where username = ?`;
    connection.query(query, [username], (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(rows);
    });
})










app.listen(3000, () => {
    console.log('Server started on port 3000');
});