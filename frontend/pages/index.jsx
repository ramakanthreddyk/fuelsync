import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import styles from '../styles/Home.module.scss';

export default function Home() {
  const [summary, setSummary] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchSummary();
        setSummary(data.summary);
        setTotal(data.totalAmount);
      } catch (err) {
        console.error('Error fetching summary:', err.message);
      }
    };
    loadSummary();
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.content}>
        <Image src="/logo.svg" alt="FuelSync Logo" width={64} height={64} style={{ marginBottom: '1em' }} />
        <h1 className={styles.title}>
          <span style={{ color: '#005bb5' }}>FuelSync</span> OCR Upload & Sales Dashboard
        </h1>
        <p className={styles.subtitle}>
          Effortlessly digitize your fuel receipts.<br />
          Upload an image and get instant, accurate OCR results.<br />
          View sales summary at a glance.
        </p>

        <div style={{
          marginTop: '2em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.7em'
        }}>
          <span style={{ color: '#888', fontSize: '0.95em' }}>
            <a href="/upload" style={{ color: '#0070f3', fontWeight: 600 }}>Go to Upload</a>
          </span>
          <span style={{ color: '#888', fontSize: '0.95em' }}>
            New here? <a href="/register" style={{ color: '#0070f3', fontWeight: 600 }}>Create an account</a>
          </span>
          <span style={{ color: '#888', fontSize: '0.95em' }}>
            Already registered? <a href="/login" style={{ color: '#0070f3', fontWeight: 600 }}>Login</a>
          </span>
        </div>

        {/* Sales Summary */}
        <div className="mt-8 w-full max-w-3xl">
          <h2 className="text-lg font-semibold mb-2">Today's Total Sales: ₹{total.toFixed(2)}</h2>
          {summary.map((pump) => (
            <div key={pump.pump_sno} className="border p-4 mb-4 rounded shadow-sm">
              <h3 className="font-bold text-blue-600">Pump: {pump.pump_sno}</h3>
              <p className="text-sm text-gray-500">Last Update: {new Date(pump.time).toLocaleString()}</p>
              <table className="w-full mt-2 text-sm border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Nozzle</th>
                    <th className="border px-2 py-1">Fuel Type</th>
                    <th className="border px-2 py-1">Price (₹)</th>
                    <th className="border px-2 py-1">Volume (L)</th>
                    <th className="border px-2 py-1">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(pump.nozzles).map(([key, val]) => (
                    <tr key={key}>
                      <td className="border px-2 py-1">{key}</td>
                      <td className="border px-2 py-1 capitalize">{val.fuelType}</td>
                      <td className="border px-2 py-1">{val.price}</td>
                      <td className="border px-2 py-1">{val.volume}</td>
                      <td className="border px-2 py-1">{val.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
