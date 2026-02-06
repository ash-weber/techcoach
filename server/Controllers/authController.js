const getConnection = require('../Models/database');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../Utility/mail');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

/* =========================
   Password Helper Functions
========================= */

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(":");
    const hashVerify = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === hashVerify;
}

/* =========================
   Register User
========================= */

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    let conn;
    try {
        conn = await getConnection();

        const rows = await conn.query(
            "SELECT email FROM techcoach_lite.techcoach_users WHERE email = ? AND is_verified = 1",
            [email]
        );

        if (rows.length > 0) {
            return res.status(409).json({ message: 'A verified user with this email already exists.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const passwordHash = hashPassword(password);

        await conn.query(
            `INSERT INTO techcoach_lite.techcoach_users 
            (displayName, username, email, password_hash, login_provider, otp, otp_expires, is_verified)
            VALUES (?, ?, ?, ?, 'local', ?, ?, 0)
            ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            otp = VALUES(otp),
            otp_expires = VALUES(otp_expires),
            is_verified = 0`,
            [username, username, email, passwordHash, otp, otpExpires]
        );

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP has been sent to your email address. Please verify to complete registration.' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'An error occurred during registration.' });
    } finally {
        if (conn) conn.release();
    }
};

/* =========================
   Verify OTP
========================= */

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Please provide both email and OTP.' });
    }

    let conn;
    try {
        conn = await getConnection();

        const rows = await conn.query(
            "SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?",
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'User not found or registration not initiated.' });
        }

        const user = rows[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'This account is already verified.' });
        }

        if (user.otp !== otp || new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        await conn.query(
            "UPDATE techcoach_lite.techcoach_users SET is_verified = 1, otp = NULL, otp_expires = NULL WHERE user_id = ?",
            [user.user_id]
        );

        const payload = { id: user.user_id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({
            message: 'Account verified successfully! You are now logged in.',
            token
        });

    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ error: 'An error occurred during verification.' });
    } finally {
        if (conn) conn.release();
    }
};

/* =========================
   Login User
========================= */

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    let conn;
    try {
        conn = await getConnection();

        const rows = await conn.query(
            "SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?",
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Account not verified. Please check your email for OTP.' });
        }

        if (user.login_provider !== 'local') {
            return res.status(403).json({ message: 'This account uses Google login. Please sign in with Google.' });
        }

        const isMatch = verifyPassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = { id: user.user_id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({
            message: 'Login successful!',
            token
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { registerUser, loginUser, verifyOtp };
