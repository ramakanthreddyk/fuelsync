// userController.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const pool = require('../models/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');


// Register Function
const register = async(req, res) => {
    const { email, phone, password } = req.body;
    console.log(`[REGISTER] Request received with email: ${email}, phone: ${phone}`);

    if (!email || !phone || !password) {
        console.log(`[REGISTER] Missing fields in request`);
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserId = uuidv4();

        console.log(`[REGISTER] Hashed password created, proceeding to insert user into DB`);
        const query = `
            INSERT INTO users (user_id, email, phone, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, email, phone, plan;
        `;
        const values = [newUserId, email, phone, hashedPassword];
        const result = await pool.query(query, values);

        console.log(`[REGISTER] User registered successfully:`, result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(`[REGISTER] Error occurred:`, err);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Login Function
const login = async(req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempting login for:`, email);

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR phone = $1`, [email]
        );

        console.log(`[LOGIN] Query result:`, result.rows);
        const user = result.rows[0];

        if (!user) {
            console.log(`[LOGIN] User not found for email/phone: ${email}`);
            return res.status(401).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log(`[LOGIN] Invalid password for user: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user.user_id, email: user.email, plan: user.plan },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        console.log(`[LOGIN] Login successful, token generated for user: ${email}`);
        res.json({ token });
    } catch (err) {
        console.error(`[LOGIN] Error occurred:`, err);
        res.status(500).json({ message: 'Login error' });
    }
};

// Profile Function
const profile = async(req, res) => {
    try {
        const userId = req.user.user_id;
        console.log(`[PROFILE] Fetching profile for user ID: ${userId}`);

        const result = await pool.query(
            `SELECT user_id, email, phone, plan, is_active, created_at FROM users WHERE user_id = $1`, [userId]
        );

        if (result.rows.length === 0) {
            console.log(`[PROFILE] User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[PROFILE] Profile data:`, result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`[PROFILE] Error fetching profile:`, err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

module.exports = {
    register,
    login,
    profile,
};