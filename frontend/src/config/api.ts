// Centralized API configuration
const getApiBaseUrl = (): string => {
    // In production, use the current origin with /api/v1 prefix
    // In development, use localhost:8000
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // For production deployment, use the Render backend URL
    if (process.env.NODE_ENV === 'production') {
        return 'https://trading-journal-an5z.onrender.com/api/v1';
    }

    // Default for local development
    return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
