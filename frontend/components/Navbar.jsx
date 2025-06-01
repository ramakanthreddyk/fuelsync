import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../styles/Navbar.module.scss';

export default function Navbar() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => router.pathname === path ? styles.active : '';

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/logo.svg"
              alt="FuelSync Logo"
              width={36}
              height={36}
              className={styles.logo}
              priority
            />
            <span className={styles.brandText}>FuelSync</span>
          </Link>
        </div>
        <button
          className={styles.toggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
        <div className={`${styles.navLinks} ${menuOpen ? styles.show : ''}`}>
          <Link href="/" className={isActive('/')}>Home</Link>
          <Link href="/sales" className={isActive('/sales')}>Sales</Link>
          {token && (
            <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          )}
          <Link href="/nozzle-config" className={isActive('/nozzle-config')}>Nozzle Config</Link>
          {!token && (
            <>
              <Link href="/login" className={isActive('/login')}>Login</Link>
              <Link href="/register" className={isActive('/register')}>Register</Link>
            </>
          )}
          {token && (
            <>
              <button
                className={isActive('/logout')}
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}