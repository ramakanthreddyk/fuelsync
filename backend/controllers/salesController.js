const pool = require('../models/db');

const calculateSale = async (req, res) => {
  const { pump_sno } = req.params;
  console.log(`[SALES] Calculating sale for Pump: ${pump_sno}`);

  try {
    const query = `
      SELECT *
      FROM uploads
      WHERE pump_sno = $1
      ORDER BY 
        COALESCE(
          TO_TIMESTAMP(date || ' ' || time, 'YYYY-MM-DD HH24:MI:SS'), 
          uploaded_at
        ) DESC
      LIMIT 2;
    `;
    const result = await pool.query(query, [pump_sno]);

    if (result.rows.length < 2) {
      return res.status(400).json({ message: 'Not enough data to calculate sale' });
    }

    const [latest, previous] = result.rows;

    const sales = {};
    for (let i = 1; i <= 4; i++) {
      const nozzleKey = `nozzle_${i}`;
      const latestValue = parseFloat(latest[nozzleKey]);
      const previousValue = parseFloat(previous[nozzleKey]);

      sales[nozzleKey] = {
        latest: isNaN(latestValue) ? null : latestValue,
        previous: isNaN(previousValue) ? null : previousValue,
        sale: (isNaN(latestValue) || isNaN(previousValue)) ? null : +(latestValue - previousValue).toFixed(3),
      };
    }

    res.json({
      pump_sno,
      latest_date: latest.date || latest.uploaded_at,
      previous_date: previous.date || previous.uploaded_at,
      sales,
    });
  } catch (err) {
    console.error(`[SALES] Error:`, err);
    res.status(500).json({ message: 'Error calculating sale' });
  }
};

const getPumpSnos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT pump_sno
      FROM uploads
      WHERE pump_sno IS NOT NULL
      ORDER BY pump_sno ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('[SALES] Error fetching pump SNOS:', err);
    res.status(500).json({ message: 'Error fetching pumps' });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    // Get distinct pumps
    const pumpsResult = await pool.query(`
      SELECT DISTINCT pump_sno FROM uploads WHERE pump_sno IS NOT NULL;
    `);

    const pumps = pumpsResult.rows.map(row => row.pump_sno);
    const summary = [];
    let totalAmount = 0;

    const priceResult = await pool.query(`SELECT * FROM prices`);
    const priceMap = {};
    priceResult.rows.forEach(p => { priceMap[p.fuel_type.toLowerCase()] = parseFloat(p.price); });

    const fuelTypeMap = { 1: 'petrol', 2: 'diesel', 3: 'petrol', 4: 'diesel' };

    for (const pump of pumps) {
      const dataResult = await pool.query(`
        SELECT * FROM uploads
        WHERE pump_sno = $1
        ORDER BY COALESCE(TO_TIMESTAMP(date || ' ' || time, 'YYYY-MM-DD HH24:MI:SS'), uploaded_at) DESC
        LIMIT 1;
      `, [pump]);

      const row = dataResult.rows[0];
      if (!row) continue;

      const pumpSummary = {
        pump_sno: pump,
        time: row.date || row.uploaded_at,
        nozzles: {}
      };

      for (let i = 1; i <= 4; i++) {
        const nozzleKey = `nozzle_${i}`;
        const fuelType = fuelTypeMap[i];
        const price = priceMap[fuelType] ?? 0;
        const volume = parseFloat(row[nozzleKey]) || 0;
        const amount = +(volume * price).toFixed(2);

        pumpSummary.nozzles[nozzleKey] = { volume, fuelType, price, amount };
        totalAmount += amount;
      }

      summary.push(pumpSummary);
    }

    res.json({ summary, totalAmount });
  } catch (err) {
    console.error('[SALES] Error fetching summary:', err);
    res.status(500).json({ message: 'Error fetching summary' });
  }
};



module.exports = {
  calculateSale,
  getPumpSnos,
  getSalesSummary
};
