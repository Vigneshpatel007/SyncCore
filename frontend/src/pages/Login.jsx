import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../utils/format';

// The same sequence as Fig 1 in the project abstract
const steps = [
  ['Login request', 'Username and password are sent over HTTPS'],
  ['Credentials verified', 'Checked against the BCrypt hash in MySQL'],
  ['Role assigned', 'Administrator or Employee, signed into a JWT'],
  ['Access granted', 'Only the APIs your role allows are unlocked'],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) { setError('Enter your username and password.'); return; }
    setBusy(true); setError('');
    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <section className="login-story">
        <div className="brand brand-light">
          <span className="brand-mark" aria-hidden="true" />
          <div><strong>SyncCore</strong><small>Integrated business management</small></div>
        </div>
        <h1>Products, stock, customers and sales in one place.</h1>
        <p>Every request passes four checks before it touches your data.</p>
        <ol className="flow">
          {steps.map(([title, text]) => (
            <li key={title}><strong>{title}</strong><span>{text}</span></li>
          ))}
        </ol>
      </section>

      <section className="login-form">
        <form onSubmit={submit} noValidate>
          <h2>Sign in</h2>
          <p className="muted">Use the account your administrator created for you.</p>
          {error && <div className="banner banner-error" role="alert">{error}</div>}
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p className="demo-hint">Demo accounts: <code>admin / admin123</code> (administrator) and <code>staff / staff123</code> (employee)</p>
        </form>
      </section>
    </div>
  );
}
