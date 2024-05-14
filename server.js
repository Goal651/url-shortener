require('dotenv').config();
const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const mysql = require('mysql');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();


//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));


//Routes
app.use(routes);


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

});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});