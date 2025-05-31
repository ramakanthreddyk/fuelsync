import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Register.module.scss';

const BASE_URL = 'http://localhost:5000/api';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("hp");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${BASE_URL}/v1/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, password, company }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.message || "Registration failed");
    }
  };

  return (
    <Layout>
      <div className={styles.registerWrapper}>
        <form className={styles.registerForm} onSubmit={handleSubmit} autoComplete="off">
          <h1 className={styles.title}>Register</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <select
            className={styles.input}
            value={company}
            onChange={e => setCompany(e.target.value)}
            required
          >
            <option value="hp">HP</option>
            <option value="iocl">IOCL</option>
          </select>
          <button type="submit" className={styles.button}>
            Register
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </Layout>
  );
}