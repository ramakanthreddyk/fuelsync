// services/upload.js
const BASE_URL = 'http://localhost:5000/api/v1'; // Ensure correct API path

export const uploadFile = async(file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
};

export const getUploads = async() => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/uploads`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch uploads');
    return data;
};