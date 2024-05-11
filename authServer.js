require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;


const app = express();


//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





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



const generateAccessToken = (data) => {
    return jwt.sign(data, accessTokenSecret);
}


app.post('/login', (req, res) => {
    const { email } = req.body;


    let query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if (result.length > 0) {

            const { email } = result[0];
            const accessToken = generateAccessToken(email);
            let query1 = 'INSERT INTO token (email, token) VALUES (?, ?)';
            connection.query(query1, [email, accessToken], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                res.status(200).cookie('accessToken', accessToken, { httpOnly: true }).send({ message:email});
            });

        } else {
            res.status(401).send('Invalid credentials');
        }
    })

})

const verifyToken = (token, callback) => {
    if (token == null) return callback(new Error('Token is null'), null);
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return callback(err, null);
        let username = user.username;
        callback(null, username);
    });
};

app.get('/getHistory/:token', (req, res) => {
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
});




app.delete('/logout', (req, res) => {

    let query = "DELETE FROM tokens WHERE token = ?";
    connection.query(query, [req.body.token], (err, result) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.sendStatus(204);
    })

})

app.listen(3001, () => {
    console.log('Server started on port 3001');
});