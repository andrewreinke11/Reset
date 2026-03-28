// Types matching the backend models
export interface Pixel {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export interface PaletteColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  pixels: Pixel[];
}

export interface Model {
  width: number;
  height: number;
  pixels: Pixel[][];
  palette: PaletteColor[];
}

export interface User {
  userName: string;
  email: string;
  files: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface FileListResponse {
  files: string[];
}

export interface FileResponse {
  model: Model;
  canUndo: boolean;
  canRedo: boolean;
}

export interface ModelResponse {
  model: Model;
  canUndo: boolean;
  canRedo: boolean;
}