// services/upload.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const uploadFile = async(file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/v1/upload`, {
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
    const res = await fetch(`${BASE_URL}/v1/uploads`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch uploads');
    return data;
};