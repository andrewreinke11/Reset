import axios from 'axios';
import { User, Model, FileResponse, ModelResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

interface AuthResponse {
  user: User;
  token: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (userName: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users', { userName, email, password });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userName', userName);
    return response.data;
  },

  login: async (userName: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/login', { userName, password });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userName', userName);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
  },

  getCurrentUser: (): string | null => {
    const token = localStorage.getItem('authToken');
    return token ? localStorage.getItem('userName') : null;
  },
};

export const fileService = {
  createFile: async (fileName: string, width: number, height: number): Promise<Model> => {
    const response = await api.post('/files/create', { fileName, width, height });
    return response.data.model;
  },

  getFile: async (fileName: string): Promise<FileResponse> => {
    const response = await api.get(`/files/${fileName}`);
    return response.data;
  },

  listFiles: async (): Promise<string[]> => {
    const response = await api.get('/files');
    return response.data.files;
  },

  addColorToPalette: async (fileName: string, red: number, green: number, blue: number, alpha: number): Promise<ModelResponse> => {
    const response = await api.post(`/files/${fileName}/palette/add`, { red, green, blue, alpha });
    return response.data;
  },

  updatePaletteColor: async (fileName: string, colorIndex: number, red: number, green: number, blue: number, alpha: number): Promise<ModelResponse> => {
    const response = await api.put(`/files/${fileName}/palette/${colorIndex}`, { red, green, blue, alpha });
    return response.data;
  },

  recolorPixel: async (fileName: string, x: number, y: number, colorIndex: number): Promise<ModelResponse> => {
    const response = await api.put(`/files/${fileName}/pixel`, { x, y, colorIndex });
    return response.data;
  },

  undo: async (fileName: string): Promise<FileResponse> => {
    const response = await api.post(`/files/${fileName}/undo`);
    return response.data;
  },

  redo: async (fileName: string): Promise<FileResponse> => {
    const response = await api.post(`/files/${fileName}/redo`);
    return response.data;
  },

  deleteFile: async (fileName: string): Promise<void> => {
    await api.delete(`/files/${fileName}`);
  },
};

export default api;