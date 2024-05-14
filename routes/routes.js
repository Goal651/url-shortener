const express = require('express');
const router = express.Router();
const { LoginUser } = require('../controllers/authController');
const {checkUser, userHistory, urlShortener } = require('../controllers/urlShortenerController');


//Authentication
router.get('/get-history/:token', checkUser);
router.post('/login-user', LoginUser);



//Url shortening

router.post('/shorten-url', urlShortener);
router.post

//User history
router.get('/history/:username', userHistory);


module.exports = router;
