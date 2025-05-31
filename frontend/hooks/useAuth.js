// hooks/useAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useAuth() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthenticated(true);
        } else {
            setAuthenticated(false);
            router.push('/login'); // Redirect to login if token missing
        }
        setLoading(false);
    }, [router]);

    return { loading, authenticated };
}