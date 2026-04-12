import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const Palette = ({ palette, selectedColorIndex, onColorSelect, onAddColor, onUpdateColor }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('add');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [selectedAlpha, setSelectedAlpha] = useState(255);
    const rgbToHex = (r, g, b) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const openAddColor = () => {
        setPickerMode('add');
        setSelectedColor('#000000');
        setSelectedAlpha(255);
        setShowColorPicker(true);
    };
    const openUpdateColor = () => {
        if (selectedColorIndex < 0 || selectedColorIndex >= palette.length)
            return;
        const selected = palette[selectedColorIndex];
        setPickerMode('update');
        setSelectedColor(rgbToHex(selected.red, selected.green, selected.blue));
        setSelectedAlpha(selected.alpha);
        setShowColorPicker(true);
    };
    const handleColorChange = (event) => {
        setSelectedColor(event.target.value);
    };
    const handleAlphaChange = (event) => {
        setSelectedAlpha(Number(event.target.value));
    };
    const handleApplyColor = () => {
        const hex = selectedColor.replace('#', '');
        const red = parseInt(hex.substr(0, 2), 16);
        const green = parseInt(hex.substr(2, 2), 16);
        const blue = parseInt(hex.substr(4, 2), 16);
        if (pickerMode === 'add') {
            onAddColor(red, green, blue, selectedAlpha);
        }
        else {
            onUpdateColor(selectedColorIndex, red, green, blue, selectedAlpha);
        }
        setShowColorPicker(false);
    };
    return (_jsxs("div", { className: "palette-container", children: [_jsx("h3", { children: "Palette" }), _jsx("div", { className: "palette-colors", children: palette.map((color, index) => (_jsx("div", { className: `palette-color ${selectedColorIndex === index ? 'selected' : ''}`, style: {
                        backgroundColor: `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})`,
                        width: '40px',
                        height: '40px',
                        border: selectedColorIndex === index ? '3px solid #000' : '1px solid #ccc',
                        cursor: 'pointer',
                        display: 'inline-block',
                        margin: '2px'
                    }, onClick: () => onColorSelect(index), title: `Color ${index}: rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})` }, index))) }), !showColorPicker ? (_jsxs("div", { className: "palette-actions", children: [_jsx("button", { onClick: openAddColor, className: "add-color-btn", children: "Add Color" }), _jsx("button", { onClick: openUpdateColor, className: "edit-color-btn", disabled: palette.length === 0, children: "Edit Selected Color" })] })) : (_jsxs("div", { className: "color-picker", children: [_jsx("input", { type: "color", value: selectedColor, onChange: handleColorChange, style: { marginRight: '10px' } }), _jsxs("div", { style: { display: 'inline-block', marginRight: '10px' }, children: [_jsxs("label", { htmlFor: "alpha-slider", style: { display: 'block', fontSize: '12px' }, children: ["Transparency: ", Math.round((selectedAlpha / 255) * 100), "%"] }), _jsx("input", { id: "alpha-slider", type: "range", min: "0", max: "255", value: selectedAlpha, onChange: handleAlphaChange, style: { width: '100px' } })] }), _jsx("button", { onClick: handleApplyColor, className: "add-color-confirm-btn", children: pickerMode === 'add' ? 'Add' : 'Update' }), _jsx("button", { onClick: () => setShowColorPicker(false), className: "cancel-btn", children: "Cancel" })] }))] }));
};
//# sourceMappingURL=Palette.js.map