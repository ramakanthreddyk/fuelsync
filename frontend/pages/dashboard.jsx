import { useEffect, useState } from 'react';
import { getUploads } from '../services/upload';
import UploadTable from '../components/uploadTable';

export default function Dashboard() {
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUploads();
        setUploads(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <UploadTable data={uploads} />
    </div>
  );
}
