// controllers/nozzleConfigController.js

const pool = require('../models/db');

exports.updateNozzleConfig = async (req, res) => {
  const { pump_sno, mappings } = req.body;
  console.log('[NOZZLE CONFIG] Updating:', mappings);

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM pump_nozzle_config WHERE pump_sno = $1', [pump_sno]);

    for (const { nozzle, fuel } of mappings) {
      await pool.query(`
        INSERT INTO pump_nozzle_config (pump_sno, nozzle_number, fuel_type)
        VALUES ($1, $2, $3)
      `, [pump_sno, nozzle, fuel]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Nozzle configuration updated.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('[NOZZLE CONFIG] Error:', err);
    res.status(500).json({ message: 'Error updating nozzle configuration.' });
  }
};

exports.getNozzleConfig = async (req, res) => {
  const { pump_sno } = req.params;

  try {
    const result = await pool.query(`
      SELECT nozzle_number, fuel_type FROM pump_nozzle_config
      WHERE pump_sno = $1
    `, [pump_sno]);

    res.json(result.rows);
  } catch (err) {
    console.error('[NOZZLE CONFIG] Error:', err);
    res.status(500).json({ message: 'Error fetching nozzle configuration.' });
  }
};
