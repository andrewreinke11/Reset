import { User, Model, FileResponse, ModelResponse } from '../types';
declare const api: import("axios").AxiosInstance;
export declare const authService: {
    register: (userName: string, email: string, password: string) => Promise<User>;
    login: (userName: string, password: string) => Promise<User>;
    logout: () => void;
    getCurrentUser: () => string | null;
};
export declare const fileService: {
    createFile: (fileName: string, width: number, height: number) => Promise<Model>;
    getFile: (fileName: string) => Promise<FileResponse>;
    listFiles: () => Promise<string[]>;
    addColorToPalette: (fileName: string, red: number, green: number, blue: number, alpha: number) => Promise<ModelResponse>;
    updatePaletteColor: (fileName: string, colorIndex: number, red: number, green: number, blue: number, alpha: number) => Promise<ModelResponse>;
    recolorPixel: (fileName: string, x: number, y: number, colorIndex: number) => Promise<ModelResponse>;
    undo: (fileName: string) => Promise<FileResponse>;
    redo: (fileName: string) => Promise<FileResponse>;
    deleteFile: (fileName: string) => Promise<void>;
};
export default api;
//# sourceMappingURL=api.d.ts.map