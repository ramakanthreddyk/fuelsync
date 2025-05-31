import React from 'react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import styles from '../styles/Home.module.scss';

export default function UploadPage() {
    return (
        <Layout>
            <section className={styles.wrapper}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Upload Fuel Receipt</h1>
                    <p className={styles.subtitle}>
                        Select and upload your fuel receipt image to get instant OCR results.
                    </p>
                    <FileUpload />
                </div>
            </section>
        </Layout>
    );
}