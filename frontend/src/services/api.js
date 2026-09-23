import { SEED_PROPERTIES } from './seedData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => localStorage.getItem('perch_token');
export const setAuthToken = (token) => localStorage.setItem('perch_token', token);
export const removeAuthToken = () => localStorage.removeItem('perch_token');

export const getStoredUser = () => {
  const u = localStorage.getItem('perch_user');
  return u ? JSON.parse(u) : null;
};
export const setStoredUser = (user) => localStorage.setItem('perch_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('perch_user');

// Local storage helpers for offline/embedded mode
const getLocalProperties = () => {
  const custom = localStorage.getItem('perch_custom_properties');
  const customList = custom ? JSON.parse(custom) : [];
  return [...customList, ...SEED_PROPERTIES];
};

const getLocalInquiries = () => {
  const inqs = localStorage.getItem('perch_inquiries');
  return inqs ? JSON.parse(inqs) : [];
};

async function fetchAPI(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`API call failed for ${endpoint}, switching to local store:`, err);
  }

  // Fallback to local store
  return handleLocalFallback(endpoint, options);
}

function handleLocalFallback(endpoint, options) {
  const method = options.method || 'GET';
  const url = new URL(`http://localhost${endpoint}`);
  const path = url.pathname;
  const params = url.searchParams;

  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    const dummyUser = { id: 1, name: "Demo User", email: "user@perch.local", role: "tenant", is_owner: false };
    setAuthToken("demo_token_xyz");
    setStoredUser(dummyUser);
    return { access_token: "demo_token_xyz", token_type: "bearer", user: dummyUser };
  }

  if (path.includes('/auth/me')) {
    return getStoredUser() || { id: 1, name: "Demo Guest", email: "guest@perch.local", role: "tenant", is_owner: false };
  }

  if (path.includes('/properties/featured')) {
    return getLocalProperties().filter(p => p.is_featured);
  }

  if (path.includes('/properties') && method === 'GET') {
    let items = getLocalProperties();
    const category = params.get('category');
    const gender = params.get('gender');
    const city = params.get('city');
    const search = params.get('search');
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');

    if (category && category !== 'all') {
      items = items.filter(p => p.category === category);
    }
    if (gender && gender !== 'all') {
      items = items.filter(p => p.gender_preference === gender || p.gender_preference === 'all');
    }
    if (city) {
      items = items.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.locality.toLowerCase().includes(q) || 
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice) items = items.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) items = items.filter(p => p.price <= parseFloat(maxPrice));

    return items;
  }

  if (path.includes('/owner/properties') && method === 'POST') {
    const newProp = JSON.parse(options.body);
    newProp.id = Date.now();
    newProp.rating = 5.0;
    newProp.total_reviews = 0;
    newProp.is_available = true;
    const existing = JSON.parse(localStorage.getItem('perch_custom_properties') || '[]');
    localStorage.setItem('perch_custom_properties', JSON.stringify([newProp, ...existing]));
    return newProp;
  }

  if (path.includes('/owner/properties') && method === 'GET') {
    return JSON.parse(localStorage.getItem('perch_custom_properties') || '[]');
  }

  if (path.includes('/inquiries') && method === 'POST') {
    const inq = JSON.parse(options.body);
    inq.id = Date.now();
    inq.created_at = new Date().toISOString();
    inq.status = 'pending';
    const allInqs = getLocalInquiries();
    localStorage.setItem('perch_inquiries', JSON.stringify([inq, ...allInqs]));
    return inq;
  }

  if (path.includes('/owner/inquiries')) {
    return getLocalInquiries();
  }

  return [];
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

  geocode: async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      return await res.json();
    } catch {
      return [];
    }
  },

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
