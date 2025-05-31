const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchPumpSnos = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/v1/sales/pumps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching pumps');
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

export const fetchSummary = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/sales/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching sales summary');
  return res.json();
};
