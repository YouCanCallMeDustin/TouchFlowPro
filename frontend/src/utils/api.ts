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

        if (errorData?.error) {
            throw new ApiError(
                errorData.error.message,
                errorData.error.code || 'API_ERROR',
                response.status,
                errorData.error.details
            );
        }

        throw new ApiError(response.statusText, 'UNKNOWN_ERROR', response.status);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
};
