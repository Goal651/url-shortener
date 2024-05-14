const jwt = require('jsonwebtoken');
const { validateSignup } = require('../schema/dataSchema');
const generateAccessToken = (data) => {
    return jwt.sign(data, accessTokenSecret);
}


const LoginUser = async (req, res) => {
    const { error, value } = validateSignup(req.body);
    if (error) {
        console.log(error)
        return res.status(400).send(error.details);
    };
    const { username, email, password } = value;
    const getUser = () => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM users WHERE email = ? ';
            connection.query(query, [email], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(result);
            })
        })
    }
    const user = await getUser();
    const accessToken = generateAccessToken(user);

    const saveToken = () => {
        return new Promise((resolve, reject) => {
            let query = 'INSERT INTO token (email, token) VALUES (?, ?)';
            connection.query(query, [email, accessToken], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(result);
            })
        })
    }

    saveToken().then(() => {
        res.status(200).cookie('accessToken', accessToken, { httpOnly: true }).send({ message: email });
    }).catch((error) =>  console.log(error) );
}

module.exports = { LoginUser }