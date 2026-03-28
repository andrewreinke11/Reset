import type { PaletteColor } from './PaletteColor';
import type { Pixel } from './Pixel';
export interface Model{
    width: number;
    height: number;
    pixels: Pixel[][];
    palette: PaletteColor[];
}