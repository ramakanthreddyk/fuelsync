import Navbar from './Navbar';
import styles from '../styles/Layout.module.scss';

export default function Layout({ children }) {
    return (
        <div className={styles.layoutRoot}>
            <Navbar />
            <main className={styles.mainContent}>{children}</main>
            <footer className={styles.footer}>
                &copy; {new Date().getFullYear()} FuelSync. All rights reserved.
            </footer>
        </div>
    );
}
