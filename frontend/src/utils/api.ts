// In production (same origin), use relative paths. In dev, proxy handles it.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
    public code: string;
    public details?: any;
    public status: number;

    constructor(message: string, code: string, status: number, details?: any) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = 'ApiError';
    }
}

export const apiFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = endpoint.startsWith('/api') ? `${BASE_URL}${endpoint}` : endpoint;
    const token = localStorage.getItem('tfp_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // Fallback for non-JSON errors
            throw new ApiError(response.statusText, 'UNKNOWN_ERROR', response.status);
        }

        // Robust error extraction
        let message = response.statusText;
        let code = 'API_ERROR';
        let details = undefined;

        if (typeof errorData === 'string') {
            message = errorData;
        } else if (errorData?.error) {
            if (typeof errorData.error === 'string') {
                message = errorData.error;
            } else {
                message = errorData.error.message || message;
                code = errorData.error.code || code;
                details = errorData.error.details;
            }
        } else if (errorData?.message) {
            message = errorData.message;
        }

        throw new ApiError(message, code, response.status, details);
    }

    let data: T;
    if (response.status === 204) {
        data = {} as T;
    } else {
        data = await response.json();
    }

    // Hybrid response hack to support legacy code expecting Response object
    if (data && typeof data === 'object') {
        try {
            Object.defineProperty(data, 'ok', {
                value: true,
                writable: false,
                enumerable: false
            });
            Object.defineProperty(data, 'json', {
                value: async () => data,
                writable: false,
                enumerable: false
            });
        } catch (e) {
            console.warn('Failed to patch apiFetch response:', e);
        }
    }

    return data;
};
