import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FuelPrices() {
  const [prices, setPrices] = useState({ Petrol: '', Diesel: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/fuel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.reduce((acc, item) => {
        acc[item.fuel_type] = item.price;
        return acc;
      }, {});
      setPrices(data);
    };
    fetchPrices();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/fuel`, prices, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Prices updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving prices');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Set Fuel Prices</h1>
      <div className="mb-4">
        <label>Petrol Price:</label>
        <input
          type="number"
          className="border p-2 ml-2"
          value={prices.Petrol}
          onChange={(e) => setPrices({ ...prices, Petrol: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label>Diesel Price:</label>
        <input
          type="number"
          className="border p-2 ml-2"
          value={prices.Diesel}
          onChange={(e) => setPrices({ ...prices, Diesel: e.target.value })}
        />
      </div>
      <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
        Save Prices
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
