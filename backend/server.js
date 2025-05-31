const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // if present

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Route mounting
app.use('/api/v1', userRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1', uploadRoutes); // if used

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
