const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const { validateSignup } = require('../schema/dataSchema');
const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
}
let connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
});


const LoginUser = async (req, res) => {
    const { error, value } = validateSignup(req.body);
    if (error) return console.log(error);
    const { email } = value;
    try {
        const user = await new Promise((resolve, reject) => {
            let query = 'SELECT * FROM users WHERE email = ?';
            connection.query(query, [email], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                if (result.length > 0) resolve(result);
                else console.log(req.body);
            });
        })
            .then(async (result) => {
                const saveToken = await new Promise((resolve, reject) => {
                    let user = result[0].email;
                    console.log(user);
                    const accessToken = generateAccessToken(user);

                    let query = 'INSERT INTO token (email, token) VALUES (?, ?)';
                    connection.query(query, [email, accessToken], (err, tok) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }
                        resolve(accessToken);
                    });
                }).then((accessToken) => {
                    res.status(200).cookie('accessToken', accessToken, {
                        maxAge: 3600000, httpOnly: false, secure: false
                    }).render('dashboard');
                    
                }).catch((err) => res.sendStatus(404))
            }).catch((err) => res.sendStatus(500));
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }

}

module.exports = { LoginUser }