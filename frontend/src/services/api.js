const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => localStorage.getItem('perch_token');
export const setAuthToken = (token) => localStorage.getItem('perch_token') ? localStorage.setItem('perch_token', token) : localStorage.setItem('perch_token', token);
export const removeAuthToken = () => localStorage.removeItem('perch_token');

export const getStoredUser = () => {
  const u = localStorage.getItem('perch_user');
  return u ? JSON.parse(u) : null;
};
export const setStoredUser = (user) => localStorage.setItem('perch_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('perch_user');

async function fetchAPI(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchAPI('/auth/me'),
  updateProfile: (data) => fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  switchRole: () => fetchAPI('/auth/switch-role', { method: 'POST' }),

  // Properties Discovery
  getProperties: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return fetchAPI(`/properties?${query.toString()}`);
  },
  
  getFeatured: (coords = {}) => {
    const query = new URLSearchParams();
    if (coords.lat) query.append('lat', coords.lat);
    if (coords.lng) query.append('lng', coords.lng);
    return fetchAPI(`/properties/featured?${query.toString()}`);
  },

  getPropertyById: (id, coords = {}) => {
    const query = new URLSearchParams();
    if (coords.lat) query.append('lat', coords.lat);
    if (coords.lng) query.append('lng', coords.lng);
    return fetchAPI(`/properties/${id}?${query.toString()}`);
  },

  geocode: (query) => fetchAPI(`/properties/geocode?q=${encodeURIComponent(query)}`),

  syncOsm: (coords = {}, radius = 25) => {
    const query = new URLSearchParams();
    if (coords.lat) query.append('lat', coords.lat);
    if (coords.lng) query.append('lng', coords.lng);
    query.append('radius_km', radius);
    return fetchAPI(`/properties/sync-osm?${query.toString()}`, { method: 'POST' });
  },

  addReview: (propertyId, data) => fetchAPI(`/properties/${propertyId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Owner Actions
  createProperty: (data) => fetchAPI('/owner/properties', { method: 'POST', body: JSON.stringify(data) }),
  getMyProperties: () => fetchAPI('/owner/properties'),
  toggleStatus: (id) => fetchAPI(`/owner/properties/${id}/toggle-status`, { method: 'PATCH' }),
  deleteProperty: (id) => fetchAPI(`/owner/properties/${id}`, { method: 'DELETE' }),
  getOwnerInquiries: () => fetchAPI('/owner/inquiries'),

  // Tenant Inquiry
  submitInquiry: (data) => fetchAPI('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
};
