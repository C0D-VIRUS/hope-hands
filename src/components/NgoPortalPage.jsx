import { useEffect, useState } from 'react';
import { fetchNgoRequests, loginNgo, registerNgo } from '../lib/api';

export default function NgoPortalPage({ ngoSession, onAuthSuccess, token }) {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    ngoName: '',
    ngoLocation: '',
    ngoMapLink: '',
    email: '',
    password: '',
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const loadNgoRequests = async () => {
      if (!ngoSession?.ngo || !token) {
        setMyRequests([]);
        return;
      }

      setLoadingRequests(true);
      try {
        const data = await fetchNgoRequests(token);
        setMyRequests(data);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load NGO requests.');
      } finally {
        setLoadingRequests(false);
      }
    };

    loadNgoRequests();
  }, [ngoSession, token]);

  const handleRegisterChange = (event) => {
    setError('');
    setMessage('');
    setRegisterForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLoginChange = (event) => {
    setError('');
    setMessage('');
    setLoginForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await registerNgo(registerForm);
      setMessage(response.message);
      setMode('login');
      setLoginForm((current) => ({ ...current, email: registerForm.email }));
    } catch (registerError) {
      setError(registerError.message || 'Unable to register NGO.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const session = await loginNgo(loginForm);
      onAuthSuccess(session);
    } catch (loginError) {
      setError(loginError.message || 'Unable to log in.');
    }
  };

  return (
    <>
      <div className="page-hero">
        <h1>NGO Portal</h1>
        <p>Register your NGO, wait for admin verification, and then post donation requests with transparent progress tracking.</p>
      </div>
      <section className="section">
        {ngoSession?.ngo ? (
          <div className="form-card" style={{ maxWidth: 980 }}>
            <div className="section-header" style={{ marginBottom: 30 }}>
              <span className="section-tag">NGO Status</span>
              <h2>{ngoSession.ngo.ngoName}</h2>
              <p>
                Account status: <strong>{ngoSession.ngo.status}</strong><br />
                Email: {ngoSession.ngo.email}<br />
                Location: {ngoSession.ngo.ngoLocation}
              </p>
            </div>
            <h3 style={{ marginBottom: 16 }}>Your Requests</h3>
            {loadingRequests ? (
              <p>Loading your requests...</p>
            ) : myRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No requests posted yet.</p>
            ) : (
              <div className="requests-grid">
                {myRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="card-body">
                      <div className="card-meta">
                        <span className="card-category">{request.category}</span>
                        <span className="urgent-badge" style={{ background: 'var(--teal-pale)', color: 'var(--teal)' }}>
                          {request.status}
                        </span>
                      </div>
                      <h3>{request.itemName}</h3>
                      <p className="card-qty">Needed: <strong>{request.neededQuantityDisplay}</strong></p>
                      <p className="card-qty">Received: <strong>{request.receivedQuantityDisplay}</strong></p>
                      <p className="card-qty">Remaining: <strong>{request.remainingQuantityDisplay}</strong></p>
                      <p className="card-desc">{request.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="contact-grid" style={{ alignItems: 'start' }}>
            <div className="form-card" style={{ margin: 0 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>NGO Login</h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Gmail *</label>
                  <input name="email" type="email" required value={loginForm.email} onChange={handleLoginChange} placeholder="ngo@gmail.com" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input name="password" type="password" required value={loginForm.password} onChange={handleLoginChange} placeholder="Enter password" />
                </div>
                {error && <div className="success-msg" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>{error}</div>}
                {message && <div className="success-msg">{message}</div>}
                <button className="btn btn-primary" type="submit">Login as NGO</button>
                <button className="btn btn-outline" type="button" onClick={() => setMode('register')}>Need an NGO account?</button>
              </form>
            </div>
            <div className="form-card" style={{ margin: 0, opacity: mode === 'register' ? 1 : 0.72 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>NGO Registration</h2>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>NGO Name *</label>
                  <input name="ngoName" required value={registerForm.ngoName} onChange={handleRegisterChange} placeholder="Helping Hands Foundation" />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input name="ngoLocation" required value={registerForm.ngoLocation} onChange={handleRegisterChange} placeholder="Nigdi, Pune" />
                </div>
                <div className="form-group">
                  <label>Google Maps Link</label>
                  <input name="ngoMapLink" value={registerForm.ngoMapLink} onChange={handleRegisterChange} placeholder="Google Maps sharing link" />
                </div>
                <div className="form-group">
                  <label>Gmail *</label>
                  <input name="email" type="email" required value={registerForm.email} onChange={handleRegisterChange} placeholder="ngo@gmail.com" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input name="password" type="password" required value={registerForm.password} onChange={handleRegisterChange} placeholder="At least 6 characters" />
                </div>
                <button className="btn btn-primary" type="submit">Register NGO</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
