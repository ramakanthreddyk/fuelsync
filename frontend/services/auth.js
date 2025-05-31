// services/auth.js
const BASE_URL = 'http://localhost:5000/api';

export const login = async(email, password) => {
    const res = await fetch(`${BASE_URL}/v1/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Added Accept header for content type
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
};