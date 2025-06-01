const pool = require('../models/db');

// Get Fuel Prices for Logged-in User
exports.getFuelPrices = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(`
      SELECT fuel_type, price FROM fuel_prices WHERE user_id = $1
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('[FUEL] Error fetching prices:', err);
    res.status(500).json({ message: 'Error fetching prices' });
  }
};

// Set/Update Fuel Prices
exports.setFuelPrices = async (req, res) => {
  const userId = req.user.user_id;
  const { Petrol, Diesel } = req.body;

  try {
    // Upsert logic: delete existing, then insert new
    await pool.query(`DELETE FROM fuel_prices WHERE user_id = $1`, [userId]);

    await pool.query(`
      INSERT INTO fuel_prices (user_id, fuel_type, price) VALUES
      ($1, 'Petrol', $2),
      ($1, 'Diesel', $3)
    `, [userId, Petrol, Diesel]);

    res.json({ message: 'Fuel prices updated' });
  } catch (err) {
    console.error('[FUEL] Error saving prices:', err);
    res.status(500).json({ message: 'Error saving prices' });
  }
};
