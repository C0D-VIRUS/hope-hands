import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminDashboard,
  fetchAdminDonations,
  fetchAdminNgos,
  fetchAdminRequests,
  loginAdmin,
  updateAdminNgoStatus,
  updateAdminRequestStatus,
} from '../lib/api';

const requestStatuses = ['pending', 'approved', 'rejected', 'spam', 'fulfilled'];
const ngoStatuses = ['pending', 'approved', 'rejected'];

export default function AdminDashboardPage({ adminSession, token, onAuthSuccess, onDataChange }) {
  const [dashboard, setDashboard] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const loadData = useCallback(async () => {
    if (!adminSession || !token) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [dashboardData, ngoData, requestData, donationData] = await Promise.all([
        fetchAdminDashboard(token),
        fetchAdminNgos(token),
        fetchAdminRequests(token),
        fetchAdminDonations(token),
      ]);

      setDashboard(dashboardData);
      setNgos(ngoData);
      setRequests(requestData);
      setDonations(donationData);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [adminSession, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNgoStatus = async (ngoId, status) => {
    await updateAdminNgoStatus(token, ngoId, status);
    await loadData();
  };

  const handleRequestStatus = async (requestId, status) => {
    await updateAdminRequestStatus(token, requestId, status);
    await loadData();
    if (onDataChange) {
      await onDataChange();
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const session = await loginAdmin(loginForm);
      onAuthSuccess(session);
    } catch (loginError) {
      setError(loginError.message || 'Unable to log in as admin.');
    }
  };

  return (
    <>
      <div className="page-hero">
        <h1>Admin Dashboard</h1>
        <p>Review NGO registrations, moderate requests, and monitor donation activity from one place.</p>
      </div>
      <section className="section">
        {!adminSession ? (
          <div className="form-card" style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>Admin Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Admin Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@hopehands.org"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter admin password"
                />
              </div>
              {error && <div className="success-msg" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>{error}</div>}
              <button className="btn btn-primary" type="submit">Login as Admin</button>
            </form>
          </div>
        ) : (
          <>
            {error && <div className="success-msg" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b', marginBottom: 20 }}>{error}</div>}
            {dashboard && (
              <div className="features-grid" style={{ marginBottom: 30 }}>
                <div className="feature-card"><h3>Pending NGOs</h3><p>{dashboard.ngoCounts?.pendingNgos || 0}</p></div>
                <div className="feature-card"><h3>Pending Requests</h3><p>{dashboard.requestCounts?.pendingRequests || 0}</p></div>
                <div className="feature-card"><h3>Fulfilled Requests</h3><p>{dashboard.requestCounts?.fulfilledRequests || 0}</p></div>
                <div className="feature-card"><h3>Total Donations</h3><p>{dashboard.donationCounts?.totalDonations || 0}</p></div>
              </div>
            )}

            <div className="form-card" style={{ maxWidth: '100%', marginBottom: 30 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>NGO Verification</h2>
              {loading ? <p>Loading NGOs...</p> : ngos.map((ngo) => (
                <div key={ngo.id} style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
                  <p><strong>{ngo.ngoName}</strong> ({ngo.email})</p>
                  <p style={{ color: 'var(--text-muted)' }}>{ngo.ngoLocation}</p>
                  <p style={{ color: 'var(--text-muted)' }}>Status: <strong>{ngo.status}</strong></p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    {ngoStatuses.map((status) => (
                      <button key={status} className="btn btn-sm btn-outline" type="button" onClick={() => handleNgoStatus(ngo.id, status)}>
                        Mark {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-card" style={{ maxWidth: '100%', marginBottom: 30 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Request Moderation</h2>
              {loading ? <p>Loading requests...</p> : requests.map((request) => (
                <div key={request.id} style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
                  <p><strong>{request.itemName}</strong> from {request.ngoName}</p>
                  <p style={{ color: 'var(--text-muted)' }}>{request.description}</p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Needed: {request.neededQuantityDisplay} | Received: {request.receivedQuantityDisplay} | Remaining: {request.remainingQuantityDisplay}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>Current status: <strong>{request.status}</strong></p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    {requestStatuses.map((status) => (
                      <button key={status} className="btn btn-sm btn-outline" type="button" onClick={() => handleRequestStatus(request.id, status)}>
                        Mark {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-card" style={{ maxWidth: '100%' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Donation Records</h2>
              {loading ? <p>Loading donations...</p> : donations.length === 0 ? <p>No donations yet.</p> : donations.map((donation) => (
                <div key={donation.id} style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
                  <p><strong>{donation.donorName}</strong> donated {donation.quantity} of {donation.itemName}</p>
                  <p style={{ color: 'var(--text-muted)' }}>UUID: {donation.donationUuid}</p>
                  <p style={{ color: 'var(--text-muted)' }}>Email status: {donation.emailStatus}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
