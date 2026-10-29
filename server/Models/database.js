// const mariadb = require('mariadb');
// require("dotenv").config();

// const pool = mariadb.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     connectTimeout: 1000000,
//     connectionLimit: 60,
//     port: process.env.DB_PORT,
//     waitForConnections: true
// });

// async function getConnection(querys) {
//     const connection =  pool.getConnection();
//     try {
//         return connection;
//     }catch (error) {
//     if (connection) connection.end()
//         console.error("Error connecting to MariaDB:", error);
//         throw error;
//     }
// }

// module.exports = getConnection;



const mariadb = require('mariadb');
require("dotenv").config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectTimeout: 1000000,
    connectionLimit:60,
    port: process.env.DB_PORT,
    waitForConnections: true
});

async function getConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Connected to MariaDB');
        console.log(
            pool.activeConnections(),
            pool.idleConnections(),
            pool.totalConnections()
        );
        return await (connection);
    } catch (error) {
        console.error("Error connecting to MariaDB:", error);
        throw error;
    } finally {
        if (connection) connection.release(); 
    }
}

module.exports = getConnection;
