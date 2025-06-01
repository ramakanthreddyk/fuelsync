// pages/admin/nozzle-config.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NozzleConfig() {
  const [pumps, setPumps] = useState([]);
  const [selectedPump, setSelectedPump] = useState('');
  const [config, setConfig] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPumps = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/sales/pumps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPumps(res.data);
    };
    fetchPumps();
  }, []);

  const handleSelect = (nozzle, value) => {
    setConfig({ ...config, [nozzle]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/v1/config/${selectedPump}`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Configuration saved successfully!');
    } catch (err) {
      setMessage('Error saving configuration.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Nozzle Configuration</h1>
      <select value={selectedPump} onChange={(e) => setSelectedPump(e.target.value)} className="border p-2 mb-4">
        <option value="">Select Pump</option>
        {pumps.map((p) => (
          <option key={p.pump_sno} value={p.pump_sno}>{p.pump_sno}</option>
        ))}
      </select>

      {selectedPump && (
        <div>
          {[1, 2, 3, 4].map((nozzle) => (
            <div key={nozzle} className="mb-2">
              <label>Nozzle {nozzle}: </label>
              <select value={config[nozzle] || ''} onChange={(e) => handleSelect(nozzle, e.target.value)} className="border p-1">
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>
          ))}
          <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Save Configuration</button>
        </div>
      )}

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
