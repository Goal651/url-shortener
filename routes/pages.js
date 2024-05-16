const express = require('express');
const router = express.Router();


router.get('/home', (req, res) => {
    res.render('home', { ShortenUrl: "No URL available" });
});
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/home/url-shortened', (req, res) => {
    const { ShortenUrl } = req.query;
    const shortenUrl = `http://localhost:3000/wigo/${ShortenUrl}`
    res.render('home', { ShortenUrl: shortenUrl });
});
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { ShortenUrl: "No URL available" });
})

module.exports = router