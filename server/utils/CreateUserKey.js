const getConnection = require('../Models/database');

const createUserKey = async (req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: 'Authentication error, user not found.' });
        }

        const conn = await getConnection();
        const [user] = await conn.query('SELECT displayName, email FROM techcoach_lite.techcoach_users WHERE email = ?', [req.user.email]);
        if (conn) { conn.release(); }

        if (!user) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        req.user.key = user.displayName + user.email;

        next();
    } catch (error) {
        console.error('Error creating user key:', error);
        res.status(500).json({ error: 'An error occurred while creating user key' });
    }
};

module.exports = createUserKey;