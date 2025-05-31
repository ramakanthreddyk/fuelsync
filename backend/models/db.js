const { Pool } = require('pg');

console.log('Connecting to DB host:', process.env.DB_HOST);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false } // Azure requires SSL
});

module.exports = pool;