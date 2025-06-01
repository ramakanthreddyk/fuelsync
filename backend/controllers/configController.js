// backend/controllers/configController.js
const pool = require('../models/db');

exports.saveNozzleConfig = async (req, res) => {
  const { pump_sno } = req.params;
  const user_id = req.user.user_id; // From JWT

  const config = req.body; // { 1: 'Petrol', 2: 'Diesel', ... }
  console.log(`[CONFIG] Saving nozzle config for pump ${pump_sno} by user ${user_id}:`, config);

  try {
    // Delete existing configs for this user + pump
    await pool.query(`DELETE FROM pump_nozzle_config WHERE user_id = $1 AND pump_sno = $2`, [user_id, pump_sno]);

    // Insert new configs
    const promises = Object.entries(config).map(([nozzle_number, fuel_type]) =>
      pool.query(`
        INSERT INTO pump_nozzle_config (user_id, pump_sno, nozzle_number, fuel_type)
        VALUES ($1, $2, $3, $4)
      `, [user_id, pump_sno, nozzle_number, fuel_type])
    );

    await Promise.all(promises);
    res.json({ message: 'Nozzle configuration saved successfully' });
  } catch (err) {
    console.error('[CONFIG] Error saving config:', err);
    res.status(500).json({ message: 'Error saving configuration' });
  }
};

exports.getNozzleConfig = async (req, res) => {
  const { pump_sno } = req.params;
  const user_id = req.user.user_id; // Get from token

  try {
    const result = await pool.query(`
      SELECT nozzle_number, fuel_type FROM pump_nozzle_config
      WHERE user_id = $1 AND pump_sno = $2
    `, [user_id, pump_sno]);

    res.json(result.rows);
  } catch (err) {
    console.error('[CONFIG] Error fetching config:', err);
    res.status(500).json({ message: 'Error fetching configuration' });
  }
};