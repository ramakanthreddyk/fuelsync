const pool = require("../models/db");

const calculateSale = async (req, res) => {
  const { pump_sno } = req.params;
  console.log(`[SALES] Calculating sale for Pump: ${pump_sno}`);

  try {
    // Fetch latest 2 entries for the pump
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
      return res.status(400).json({ message: "Not enough data to calculate sale" });
    }

    const [latest, previous] = result.rows;

    // Fetch nozzle-to-fuel-type configuration for this pump
    const configResult = await pool.query(`
      SELECT nozzle_number, fuel_type FROM pump_nozzle_config WHERE pump_sno = $1
    `, [pump_sno]);

    const configMap = {};
    configResult.rows.forEach(row => {
      configMap[row.nozzle_number] = row.fuel_type ? row.fuel_type.toLowerCase() : "unknown";
    });

    // Fetch fuel prices for this user
    const pricesResult = await pool.query(`
      SELECT fuel_type, price FROM fuel_prices WHERE user_id = $1
    `, [req.user.user_id]);

    const priceMap = {};
    pricesResult.rows.forEach(row => {
      priceMap[row.fuel_type.toLowerCase()] = parseFloat(row.price);
    });

    console.log('configMap:', configMap);
    console.log('priceMap:', priceMap);

    const sales = {};
    for (let i = 1; i <= 4; i++) {
      const nozzleKey = `nozzle_${i}`;
      const latestValue = parseFloat(latest[nozzleKey]);
      const previousValue = parseFloat(previous[nozzleKey]);
      const sale = (isNaN(latestValue) || isNaN(previousValue)) ? null : +(latestValue - previousValue).toFixed(3);
      const fuelType = configMap[i] || "unknown";
      const price = priceMap[fuelType] || 0;

      sales[nozzleKey] = {
        latest: latestValue,
        previous: previousValue,
        sale,
        fuel_type: fuelType,
        sale_value: (sale !== null) ? +(sale * price).toFixed(2) : null
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
    res.status(500).json({ message: "Error calculating sale" });
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
    console.error("[SALES] Error fetching pump SNOS:", err);
    res.status(500).json({ message: "Error fetching pumps" });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const pumpsResult = await pool.query(`
      SELECT DISTINCT pump_sno FROM uploads WHERE pump_sno IS NOT NULL;
    `);

    const pumps = pumpsResult.rows.map(row => row.pump_sno);
    const summary = [];
    let totalAmount = 0;

    for (const pump of pumps) {
      const dataResult = await pool.query(`
        SELECT * FROM uploads
        WHERE pump_sno = $1
        ORDER BY COALESCE(TO_TIMESTAMP(date || ' ' || time, 'YYYY-MM-DD HH24:MI:SS'), uploaded_at) DESC
        LIMIT 1;
      `, [pump]);

      const row = dataResult.rows[0];
      if (!row) continue;

      const configResult = await pool.query(`
        SELECT nozzle_number, fuel_type FROM pump_nozzle_config WHERE pump_sno = $1
      `, [pump]);

      const configMap = {};
      configResult.rows.forEach(r => {
        configMap[r.nozzle_number] = r.fuel_type;
      });

      const priceResult = await pool.query(`
        SELECT fuel_type, price FROM fuel_prices WHERE user_id = $1
      `, [req.user.user_id]);

      const priceMap = {};
      priceResult.rows.forEach(p => {
        priceMap[p.fuel_type] = parseFloat(p.price);
      });

      const pumpSummary = {
        pump_sno: pump,
        time: row.date || row.uploaded_at,
        nozzles: {},
      };

      for (let i = 1; i <= 4; i++) {
        const nozzleKey = `nozzle_${i}`;
        const fuelType = configMap[i] || "Unknown";
        console.log(`fuelType for nozzle ${i}:`, fuelType, 'price:', priceMap[fuelType]);
        const volume = parseFloat(row[nozzleKey]) || 0;
        const amount = +(volume * price).toFixed(2);

        pumpSummary.nozzles[nozzleKey] = { volume, fuelType, price, amount };
        totalAmount += amount;
      }

      summary.push(pumpSummary);
    }

    res.json({ summary, totalAmount });
  } catch (err) {
    console.error("[SALES] Error fetching summary:", err);
    res.status(500).json({ message: "Error fetching summary" });
  }
};

module.exports = {
  calculateSale,
  getPumpSnos,
  getSalesSummary,
};
