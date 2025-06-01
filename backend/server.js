const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // if present
const nozzleConfigRoutes = require('./routes/nozzleConfigRoutes');
const configRoutes = require('./routes/configRoutes');
const fuelRoutes = require('./routes/fuelRoutes');



app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Route mounting
app.use('/api/v1', userRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1', uploadRoutes); // if used
app.use('/api/v1/nozzle', nozzleConfigRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/fuel', fuelRoutes);




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
