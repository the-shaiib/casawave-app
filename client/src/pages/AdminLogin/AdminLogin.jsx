import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin } = useStore();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await adminLogin(passcode);
    if (!result.success) {
      setError(result.message || 'Invalid passcode.');
      return;
    }

    const redirectTo = location.state?.from || '/admin';
    navigate(redirectTo, { replace: true });
  };

  return (
    <section className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p>PROTECTED ROUTE</p>
        <h1>Admin Access</h1>
        <input
          type="password"
          placeholder="ENTER PASSCODE"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          required
        />
        <button type="submit">ENTER COMMAND CENTER</button>
        {error && <span>{error}</span>}
      </form>
    </section>
  );
}

export default AdminLogin;
