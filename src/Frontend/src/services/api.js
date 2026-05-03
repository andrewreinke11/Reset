import axios from 'axios';
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
    const token = localStorage.getItem('token');
    if (userName) {
        // Prefer JWT Authorization header when available
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            config.headers['x-user-name'] = userName;
        }
        if (config.method === 'post' && config.data) {
            config.data.userName = userName;
        }
    }
    return config;
});
export const authService = {
    register: async (userName, email, password) => {
        const response = await api.post('/users', { userName, email, password });
        localStorage.setItem('userName', userName);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    login: async (userName, password) => {
        const response = await api.post('/users/login', { userName, password });
        localStorage.setItem('userName', userName);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
    },
    getCurrentUser: () => {
        return localStorage.getItem('userName');
    },
};
export const fileService = {
    createFile: async (fileName, width, height) => {
        const response = await api.post('/files/create', { fileName, width, height });
        return response.data.model;
    },
    getFile: async (fileName) => {
        const response = await api.get(`/files/${fileName}`);
        return response.data;
    },
    listFiles: async () => {
        const response = await api.get('/files');
        return response.data.files;
    },
    addColorToPalette: async (fileName, red, green, blue, alpha) => {
        const response = await api.post(`/files/${fileName}/palette/add`, { red, green, blue, alpha });
        return response.data;
    },
    updatePaletteColor: async (fileName, colorIndex, red, green, blue, alpha) => {
        const response = await api.put(`/files/${fileName}/palette/${colorIndex}`, { red, green, blue, alpha });
        return response.data;
    },
    recolorPixel: async (fileName, x, y, colorIndex) => {
        const response = await api.put(`/files/${fileName}/pixel`, { x, y, colorIndex });
        return response.data;
    },
    undo: async (fileName) => {
        const response = await api.post(`/files/${fileName}/undo`);
        return response.data;
    },
    redo: async (fileName) => {
        const response = await api.post(`/files/${fileName}/redo`);
        return response.data;
    },
    deleteFile: async (fileName) => {
        await api.delete(`/files/${fileName}`);
    },
};
export default api;
//# sourceMappingURL=api.js.map