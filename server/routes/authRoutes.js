const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../middleware/passportConfig');
const router = express.Router();
const authController = require('../controllers/authController.js');

const { insertLoginHistory } = require("../utils/gift.helpers.utils")
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyOtp);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Authentication Failed' });
        }
        req.login(user, { session: false }, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            
            const user_domain = req.user.email.split('@')[1].split('.')[0];

            const responseFromGift = await insertLoginHistory(
                req.hostname,
                req.originalUrl,
                req.headers["user-agent"] || "Unknown",
                req.user.email,
                "sso",
                user_domain
            );
            
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET_KEY,{expiresIn: '24h'});
            res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}&user_id=${user.id}`);

        });
    })(req, res, next);
});

router.get('/auth/microsoft', passport.authenticate('microsoft', { prompt: 'select_account' }));

router.get('/api/v1/auth/microsoft/callback', (req, res, next) => {
    passport.authenticate('microsoft', (err, user, info) => {

        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Authentication Failed' });
        }


        req.login(user, { session: false }, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            const user_domain = user.email.split('@')[1].split('.')[0];
            await insertLoginHistory(
                req.hostname,
                req.originalUrl,
                req.headers["user-agent"] || "Unknown",
                user.email,
                "sso",
                user_domain
            );

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '24h' });
            res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}&user_id=${user.id}`);
        });
    })(req, res, next);
});

module.exports = router;