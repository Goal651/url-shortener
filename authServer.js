require('dotenv').config();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');


const app = express();

//middlewares
app.use(cors());
app.use(express.json());

const verifyToken = (token) => {
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) { return res.sendStatus(403); }
        req.user = user;
        let username = req.user.username;
        return username;
    })

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


const users = [
    {
        email: 'bugiriwilson@gmail.com'
    },
    {
        email: 'bugiriwilson651@gmail.com'
    },
    {
        email: 'goal@gmail.com'
    }
]




const generateAccessToken = (data) => {
    return jwt.sign(data, accessTokenSecret);
}


app.post('/login', (req, res) => {
    const { email } = req.body;


    //Db thing

    let query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if (result.length > 0) {
            const user = result[0].username;
            const email = result[0].email
            const accessToken = generateAccessToken({ email: email });
            const refreshToken = jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET);


            //
            let query1 = 'INSERT INTO tokens (email, token) VALUES (?, ?)';
            connection.query(query1, [email, accessToken], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                //Store the access token on website to be accessed by frontend
                localStorage.setItem('jwt', accessToken);
            })
        } else {
            res.status(401).send('Invalid credentials');
        }
    })

})

app.get('/:token', (req, res) => {

    const token = req.params.token;
    if (token == null) return res.sendStatus(401);
    let username = verifyToken(token)

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
    })
})



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