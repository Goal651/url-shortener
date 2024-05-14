const jwt = require('jsonwebtoken');
const mysql = require('mysql');


const verifyToken = (token, callback) => {
    if (token == null) return callback(new Error('Token is null'), null);
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return callback(err, null);
        let username = user.username;
        callback(null, username);
    });
};


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
        res.redirect('/home', { longurl: shortUrl });
    });
}


const getLongurl = async (req, res) => {
    const { shortUrl } = req.params;
    const query = `SELECT longUrl FROM urls WHERE shortUrl = ?`;
    try {
        const rows = ((resolve, reject) => {
            connection.query(query, [shortUrl], async (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const urls = await rows;
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


module.exports = { userHistory, urlShortener, getLongurl, checkUser };