import axios from 'axios';
import { User, Model, FileResponse, ModelResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user authentication
api.interceptors.request.use((config) => {
  const userName = localStorage.getItem('userName');
  if (userName) {
    config.headers['x-user-name'] = userName;
    if (config.method === 'post' && config.data) {
      config.data.userName = userName;
    }
  }
  return config;
});

export const authService = {
  register: async (userName: string, email: string, password: string): Promise<User> => {
    const response = await api.post('/users', { userName, email, password });
    localStorage.setItem('userName', userName);
    return response.data;
  },

  login: async (userName: string, password: string): Promise<User> => {
    const response = await api.post('/users/login', { userName, password });
    localStorage.setItem('userName', userName);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('userName');
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem('userName');
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