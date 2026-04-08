const BASE_URL = "https://hope-hands.onrender.com/api";
const authHeaders = (token) => (
  token
    ? { Authorization: `Bearer ${token}` }
    : {}
);

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const fetchRequests = async () => {
  const response = await fetch(`${BASE_URL}/requests`);
  const data = await parseResponse(response);

  return Array.isArray(data) ? data : (data.requests || []);
};

export const createRequest = async (requestData, token) => {
  const response = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(requestData),
  });
  return parseResponse(response);
};

export const createDonation = async (donationData) => {
  const response = await fetch(`${BASE_URL}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donationData),
  });

  return parseResponse(response);
};

export const registerNgo = async (payload) => {
  const response = await fetch(`${BASE_URL}/ngo/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const loginNgo = async (payload) => {
  const response = await fetch(`${BASE_URL}/ngo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const loginAdmin = async (payload) => {
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const fetchSession = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/session`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const logoutSession = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const fetchNgoRequests = async (token) => {
  const response = await fetch(`${BASE_URL}/ngo/requests`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const fetchAdminDashboard = async (token) => {
  const response = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const fetchAdminNgos = async (token, status = '') => {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${BASE_URL}/admin/ngos${suffix}`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const updateAdminNgoStatus = async (token, ngoId, status) => {
  const response = await fetch(`${BASE_URL}/admin/ngos/${ngoId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });

  return parseResponse(response);
};

export const fetchAdminRequests = async (token, status = '') => {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${BASE_URL}/admin/requests${suffix}`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};

export const updateAdminRequestStatus = async (token, requestId, status) => {
  const response = await fetch(`${BASE_URL}/admin/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });

  return parseResponse(response);
};

export const fetchAdminDonations = async (token) => {
  const response = await fetch(`${BASE_URL}/admin/donations`, {
    headers: { ...authHeaders(token) },
  });

  return parseResponse(response);
};
