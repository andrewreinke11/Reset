import type { Pixel } from './Pixel';

export interface PaletteColor{
    red: number;
    green: number;
    blue: number;
    alpha: number;
    pixels: Pixel[];
}