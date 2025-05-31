import { useState } from 'react';
import { uploadFile } from '../services/upload';
import styles from '../styles/FileUpload.module.scss';

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
    const [result, setResult] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        setSnackbar({ open: false, message: '', type: '' });
        setResult('');
        if (!file) {
            setSnackbar({ open: true, message: 'Please select a file.', type: 'error' });
            return;
        }
        try {
            const data = await uploadFile(file);
            setResult(JSON.stringify(data, null, 2));
            setSnackbar({ open: true, message: 'Upload successful!', type: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Upload failed', type: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <div className={styles.uploadWrapper}>
            <form onSubmit={handleUpload} className={styles.uploadCard}>
                <h2 className={styles.title}>Upload Image</h2>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>
                    Upload
                </button>
            </form>
            {/*
            {result && (
                <pre className={styles.resultBox}>{result}</pre>
            )}
            */}
            {snackbar.open && (
                <div
                    className={`${styles.snackbar} ${snackbar.type === 'error' ? styles.snackbarError : styles.snackbarSuccess}`}
                    onClick={handleCloseSnackbar}
                >
                    {snackbar.message}
                </div>
            )}
        </div>
    );
}