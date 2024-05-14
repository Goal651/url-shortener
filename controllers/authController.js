const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
    return jwt.sign(data, accessTokenSecret);
}


const LoginUser = (req, res) => {
    const { email } = req.body;
    let query = 'SELECT * FROM users WHERE email = ? ';
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
                res.status(200).cookie('accessToken', accessToken, { httpOnly: true }).send({ message: email });
            });
        } else {
            res.status(401).send('Invalid credentials');
        }
    })
};


module.exports = { LoginUser }