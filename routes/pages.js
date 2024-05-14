const express = require('express');
const router = express.Router();


router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/home', (req, res) => {
    res.render('home');
});

module.exports = router