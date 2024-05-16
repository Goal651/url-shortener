require('dotenv').config();
const express = require('express');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');
const pageRoutes = require('./routes/pages');
const cors = require('cors');
const mysql = require('mysql');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();


//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//Routes
app.use(routes);
app.use(pageRoutes);


let connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
});
connection.connect((err) => {
    if (err) return console.error('error connecting: ' + err.stack);
    console.log('connected to database as id ' + connection.threadId);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index');
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});