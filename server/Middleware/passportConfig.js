require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../Utility/mail');
const getConnection = require('../Models/database');


const MicrosoftStrategy = require('passport-microsoft').Strategy;


const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 50,
    port: process.env.DB_PORT,
    waitForConnections: true
});

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    session: true // Enable session support
}, async (accessToken, refreshToken, profile, done) => {
    const connection = await getConnection();
    try {
        // console.log('Google profile object:', profile); // Log the profile object

        // Determine the correct path for the profile picture
        const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        const [existingUser] = await connection.query("SELECT * FROM techcoach_lite.techcoach_users WHERE email=?", [profile.email]);
        // connection.release();

        if (!existingUser || existingUser.length === 0) {
            // Insert the new user
            const user = await connection.query("INSERT INTO techcoach_lite.techcoach_users (displayname, email,profilePicture) VALUES (?, ?, ?) RETURNING* ", [profile.displayName, profile.email,profilePicture]);
            // console.log(user,"jfjyfku")
            sendWelcomeEmail(user);
            logLoginHistory(user.user_id);
            if (connection) connection.release();

            return done(null, { id: user[0].user_id, email: profile.email }); // Pass user info along with token
        }

        logLoginHistory(existingUser.user_id); // Log login history
        console.log(logLoginHistory, 'history')
        // console.log(existingUser,"kkkkkkkkk")
        if (connection) {
            // console.log(2);
            connection.release();
          }
        return done(null, { id: existingUser.user_id, email: profile.email }); // Pass user info along with token

        // Sign JWT token with user id and email
        // const token = jwt.sign({ id: profile.id, email: profile.email }, "111")

    } catch (error) {
        if (connection) {
            connection.release();
          }
        console.error("Error during authentication:", error);
        return done(error, null);
    }
}));

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL, 
    scope: ['user.read'],
    tenant: 'common' 
}, async (accessToken, refreshToken, profile, done) => {
    const connection = await getConnection();
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
            if (connection) connection.release();
            return done(new Error('No email found in Microsoft profile'), null);
        }

        const [existingUser] = await connection.query(
            "SELECT * FROM techcoach_lite.techcoach_users WHERE email=?", 
            [email]
        );

        if (!existingUser || existingUser.length === 0) {
            const displayName = profile.displayName || (profile.name && profile.name.givenName) || 'Microsoft User';
            const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            const user = await connection.query(
                "INSERT INTO techcoach_lite.techcoach_users (displayname, email, profilePicture, login_provider) VALUES (?, ?, ?, ?) RETURNING*",
                [displayName, email, profilePicture, profile.provider]
            );
            
            if (connection) connection.release();
            sendWelcomeEmail(user);
            logLoginHistory(user[0].user_id);
            return done(null, { id: user[0].user_id, email: email });
        }

        if (connection) connection.release();
        console.log("existinguser", existingUser)
        logLoginHistory(existingUser.user_id);
        return done(null, { id: existingUser.user_id, email: email });
    } catch (error) {
        if (connection) connection.release();
        console.error("Error during Microsoft auth:", error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user); 
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Function to log login history
async function logLoginHistory(userId) {
    try {
        const connection = await pool.getConnection();
        await connection.query("INSERT INTO techcoach_lite.techcoach_login_history (user_id, login_time) VALUES (?, NOW())", [userId]);
        connection.release();
    } catch (error) {
        console.error("Error logging login history:", error);
    }
}

module.exports = passport;