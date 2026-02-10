// In production (same origin), use relative paths. In dev, proxy handles it.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (endpoint: string, options: RequestInit = {}) => {
    const url = endpoint.startsWith('/api') ? `${BASE_URL}${endpoint}` : endpoint;
    return fetch(url, options);
};
