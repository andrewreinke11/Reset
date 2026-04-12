import React from 'react';
import { PaletteColor } from '../../types';
interface PaletteProps {
    palette: PaletteColor[];
    selectedColorIndex: number;
    onColorSelect: (index: number) => void;
    onAddColor: (red: number, green: number, blue: number, alpha?: number) => void;
    onUpdateColor: (colorIndex: number, red: number, green: number, blue: number, alpha?: number) => void;
}
export declare const Palette: React.FC<PaletteProps>;
export {};
//# sourceMappingURL=Palette.d.ts.map