const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const crypto = require('crypto');


const verifyToken = (token) => {
    if (token == null) return callback(new Error('Token is null'), null);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        return user;
    });

};


let connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
});


const generateShortUrl = (longUrl) => {
    const hash = crypto.createHash('md5').update(longUrl).digest('hex').slice(0, 5);
    return hash;
}



const checkUser = (req, res) => {
    const token = req.params.token;
    verifyToken(token, (err, username) => {
        if (err) return res.sendStatus(403);
        let query = 'SELECT * FROM tokens WHERE token = ?';
        connection.query(query, [token], (err, result) => {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            if (result.length > 0) {
                res.redirect(`http://localhost:3000/history/${username}`);
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    });
};

const urlShortener = (req, res) => {
    const { longUrl } = req.body;
    const shortUrl = generateShortUrl(longUrl);
    const username = "guest";
    const data = [longUrl, shortUrl, username];
    const query = `INSERT INTO urls (longUrl, shortUrl,email) VALUES (? , ?, ?)`;
    connection.query(query, data, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.redirect(`/home/url-shortened/?ShortenUrl=${shortUrl}`);

    });
}


const getLongurl = async (req, res) => {
    const { shortUrl } = req.params;
    const query = `SELECT longUrl FROM urls WHERE shortUrl = ?`;
    try {
        connection.query(query, [shortUrl], async (err, rows) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (rows.length === 0) {
                return res.status(404).send('Short URL not found');
            }
            const longUrl = rows[0].longUrl;
            res.send(`
                <script>
                    window.open("${longUrl}", "_blank");
                </script>
            `);
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
    }
}

const secureUrlShortener = (req, res) => {
    const accessToken = req.cookies && req.cookies.accessToken;
    if (accessToken) {
        const username  = verifyToken(accessToken);
        res.send(username);
        const { longUrl } = req.body;

        // const shortUrl = generateShortUrl(longUrl);

        // const data = [longUrl, shortUrl, username];
        // const query = `INSERT INTO urls (longUrl, shortUrl,email) VALUES (? , ?, ?)`;
        // connection.query(query, data, (err, rows) => {
        //     if (err) {
        //         console.error('error connecting: ' + err.stack);
        //         return res.status(500).json({ error: 'Internal server error' });
        //     }
        //     res.redirect(`/dashboard/?ShortenUrl=${shortUrl}`);

        // });

    } else {

        res.status(400).send('Access token cookie not found');
    }
}

const userHistory = (req, res) => {
    let username = req.params.username;
    const query = `SELECT * FROM urls where username = ?`;
    connection.query(query, [username], (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(rows);
    });
}


module.exports = { userHistory, urlShortener, getLongurl, checkUser, secureUrlShortener };