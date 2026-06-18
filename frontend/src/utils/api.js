import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Admin and sub-admin JWTs live in separate keys; normal users use `token`.
 * `config.url` is the path passed to axios (e.g. `/admin/login`, `admin/users`).
 */
function pickAuthToken(urlPath) {
  let p = urlPath || '';
  if (p && !p.startsWith('http') && !p.startsWith('/')) {
    p = `/${p}`;
  }
  if (p.includes('/admin/') && !p.includes('/admin/login')) {
    return localStorage.getItem('adminToken');
  }
  if (p.includes('/subadmin/') && !p.includes('/subadmin/login')) {
    return localStorage.getItem('subAdminToken');
  }
  return localStorage.getItem('token');
}

api.interceptors.request.use(
  (config) => {
    const path = config.url || '';
    const token = pickAuthToken(path);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const raw = error.config?.url || '';
    let path = raw;
    if (path && !path.startsWith('http') && !path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!path.startsWith('http')) {
      path = `${error.config?.baseURL || ''}${path}`;
    }

    // Wrong password / validation on login pages — do not redirect to customer login
    if (
      path.includes('/admin/login') ||
      path.includes('/subadmin/login') ||
      path.includes('/auth/login') ||
      path.includes('/auth/signup') ||
      path.includes('/auth/register') ||
      path.includes('/auth/forgot')
    ) {
      return Promise.reject(error);
    }

    if (path.includes('/admin/')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
      return Promise.reject(error);
    }
    if (path.includes('/subadmin/')) {
      localStorage.removeItem('subAdminToken');
      window.location.href = '/subadmin/login';
      return Promise.reject(error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return Promise.reject(error);
  }
);

export default api;

/**
 * Origin of the Node API (no `/api` suffix). Used for `/images/...` static uploads.
 * Set `VITE_API_BASE_URL` to your API root, e.g. `http://localhost:5000/api` or `https://api.example.com/api`.
 */
export const getBackendOrigin = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const origin = String(raw)
    .trim()
    .replace(/\/api\/?$/i, '')
    .replace(/\/+$/, '');
  return origin || 'http://localhost:5000';
};

function normalizeImageRef(ref) {
  if (ref == null) return '';
  let t = String(ref).trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  t = t.replace(/^\/images\//i, '').replace(/^images\//i, '');
  t = t.replace(/^uploads\//i, '').replace(/^\.?[\\/]+uploads[\\/]+/i, '');
  const parts = t.split(/[/\\]/);
  t = parts[parts.length - 1] || t;
  return t;
}

/** Absolute image URL (e.g. WhatsApp links). Always hits the API host. */
export const getAbsoluteImageUrl = (filename) => {
  const name = normalizeImageRef(filename);
  if (!name) return '';
  if (/^https?:\/\//i.test(name)) return name;
  const base = getBackendOrigin();
  return `${base}/images/${encodeURIComponent(name)}`;
};

/**
 * URL for `<img src>` — in dev uses `/images/...` on the Vite host so the browser proxy
 * forwards to the API (fixes localhost vs 127.0.0.1 / LAN mismatches with absolute URLs).
 */
export const getImageUrl = (filename) => {
  const name = normalizeImageRef(filename);
  if (!name) return '';
  if (/^https?:\/\//i.test(name)) return name;
  const path = `/images/${encodeURIComponent(name)}`;
  if (import.meta.env.DEV) {
    return path;
  }
  return `${getBackendOrigin()}${path}`;
};
