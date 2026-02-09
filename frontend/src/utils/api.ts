const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (endpoint: string, options: RequestInit = {}) => {
    // Only prepend BASE_URL if endpoint starts with /api
    const url = endpoint.startsWith('/api') ? `${BASE_URL}${endpoint}` : endpoint;
    return fetch(url, options);
};
