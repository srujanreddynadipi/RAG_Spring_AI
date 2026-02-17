import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('No valid token found in localStorage for request to', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  validate: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (message, sessionId = null, maxResults = 2, similarityThreshold = 0.5) => {
    const response = await api.post('/chat', {
      message,
      sessionId,
      maxResults,
      similarityThreshold,
    });
    return response.data;
  },

  getHistory: async (limit = 10) => {
    const response = await api.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  getSessionHistory: async (sessionId) => {
    const response = await api.get(`/chat/session/${sessionId}`);
    return response.data;
  },

  clearSession: async (sessionId) => {
    const response = await api.delete(`/chat/session/${sessionId}`);
    return response.data;
  },
};

// Document API
export const documentAPI = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  uploadUrl: async (url) => {
    const response = await api.post('/documents/upload-url', { url });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  delete: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export default api;
