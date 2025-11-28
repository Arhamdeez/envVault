/// <reference types="../vite-env" />
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // In production/preview, use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  
  // Fallback: try to detect if we're on Vercel and use backend URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app')) {
      // Extract project name and construct backend URL
      // If frontend is envvault-three.vercel.app, backend might be envvault-backend.vercel.app
      return 'https://envvault-backend.vercel.app';
    }
  }
  
  // Final fallback
  return 'http://localhost:3000';
};

const API_URL = getApiUrl();

// Log API URL for debugging
console.log('🔗 API URL:', API_URL);
console.log('🔍 Environment:', {
  VITE_API_URL: import.meta.env?.VITE_API_URL || 'NOT SET',
  MODE: import.meta.env?.MODE,
  DEV: import.meta.env?.DEV,
  PROD: import.meta.env?.PROD,
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error interceptor for better debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: api.defaults.baseURL,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface UploadFileDto {
  encryptedBlob: string;
  iv: string;
  filenameMasked: string;
  expiresAt?: string;
  singleUse?: boolean;
}

export interface FileResponse {
  id: string;
  filenameMasked: string;
  createdAt: string;
}

export interface ShareResponse {
  shareId: string;
  token: string;
}

export interface CreateShareDto {
  fileId: string;
  expiresAt?: string;
  usageLimit?: number;
}

export interface DownloadResponse {
  encryptedBlob: string;
  iv: string;
  filenameMasked: string;
  size: number;
}

export const authApi = {
  register: (data: RegisterDto) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginDto) => api.post<AuthResponse>('/auth/login', data),
};

export const filesApi = {
  upload: (data: UploadFileDto) => api.post<FileResponse>('/files/upload', data),
  getAll: () => api.get('/files'),
  getMetadata: (id: string) => api.get(`/files/${id}/metadata`),
};

export const sharesApi = {
  create: (data: CreateShareDto) => api.post<ShareResponse>('/shares/create', data),
  download: (token: string) => api.get<DownloadResponse>(`/shares/${token}/download`),
  revoke: (id: string) => api.post(`/shares/${id}/revoke`),
  getByFile: (fileId: string) => api.get(`/shares/file/${fileId}`),
};

export const auditApi = {
  getFileLogs: (fileId: string) => api.get(`/audit/file/${fileId}`),
};

export default api;

