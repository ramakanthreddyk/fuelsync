// services/sales.js
const BASE_URL = 'http://localhost:5000/api';

export const fetchPumpSnos = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/v1/sales/pumps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching pump numbers');
  return res.json();
};

export const fetchSaleData = async (pump_sno) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/v1/sales/${pump_sno}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching sale data');
  return res.json();
};
