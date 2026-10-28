// const jwt = require('jsonwebtoken');

// const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// const authMiddleware = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             throw new Error('Authorization header missing or invalid');
//         }

//         const token = authHeader.split(' ')[1];

//         if (!token) {
//             throw new Error('Authentication failed');
//         }
//         const verified = jwt.verify(token, JWT_SECRET_KEY);
//         req.user = verified;
//         next();
//     } catch (err) {
//         console.error('Error verifying token:', err);
//         res.status(400).send({ message: 'Invalid token !' });
//     }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Authorization header missing or invalid. Please log in.' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'Authentication failed. Please log in.' });
        }

        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({ message: 'Session timed out. Please log in again.' });
                } else {
                    return res.status(400).send({ message: 'Invalid token. Please log in.' });
                }
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).send({ message: 'An internal server error occurred.' });
    }
};

module.exports = authMiddleware;