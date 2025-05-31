const User = require('../models/userModel');
const { generateRandomPassword } = require('../utils/helpers');

exports.createOwner = async(req, res) => {
    try {
        const { name, email, phone, pumpId } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const tempPassword = generateRandomPassword();
        const newOwner = new User({
            name,
            email,
            phone,
            pumpId,
            password: tempPassword,
            role: 'owner'
        });
        await newOwner.save();

        res.status(201).json({
            message: 'Owner created successfully',
            credentials: { email, password: tempPassword }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};