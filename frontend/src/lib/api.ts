/// <reference types="../vite-env" />
import axios from 'axios';

const API_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

// Log API URL for debugging (always, to help troubleshoot)
console.log('🔗 API URL:', API_URL);
console.log('🔍 VITE_API_URL env var:', import.meta.env?.VITE_API_URL || 'NOT SET');

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

