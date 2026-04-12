import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { exportModelAsJSON, exportModelAsPNG, exportModelAsJPG, exportModelAsWebP } from '../../services/exportService';
import './ExportDialog.css';
export const ExportDialog = ({ model, fileName, onClose }) => {
    const [isExporting, setIsExporting] = useState(false);
    const handleExportJSON = async () => {
        try {
            setIsExporting(true);
            exportModelAsJSON(model, fileName);
        }
        catch (error) {
            console.error('Failed to export JSON:', error);
            alert('Failed to export JSON');
        }
        finally {
            setIsExporting(false);
            onClose();
        }
    };
    const handleExportPNG = async () => {
        try {
            setIsExporting(true);
            exportModelAsPNG(model, fileName);
        }
        catch (error) {
            console.error('Failed to export PNG:', error);
            alert('Failed to export PNG');
        }
        finally {
            setIsExporting(false);
            onClose();
        }
    };
    const handleExportJPG = async () => {
        try {
            setIsExporting(true);
            exportModelAsJPG(model, fileName);
        }
        catch (error) {
            console.error('Failed to export JPG:', error);
            alert('Failed to export JPG');
        }
        finally {
            setIsExporting(false);
            onClose();
        }
    };
    const handleExportWebP = async () => {
        try {
            setIsExporting(true);
            exportModelAsWebP(model, fileName);
        }
        catch (error) {
            console.error('Failed to export WebP:', error);
            alert('Failed to export WebP');
        }
        finally {
            setIsExporting(false);
            onClose();
        }
    };
    return (_jsx("div", { className: "export-dialog-overlay", onClick: onClose, children: _jsxs("div", { className: "export-dialog", onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { children: "Export File" }), _jsxs("div", { className: "export-section", children: [_jsx("h3", { children: "Export as JSON" }), _jsx("p", { children: "Save your pixel art data in JSON format for later editing" }), _jsx("p", { className: "file-info", children: "Format: Text (editable)" }), _jsx("button", { onClick: handleExportJSON, disabled: isExporting, className: "export-button json-button", children: "\uD83D\uDCBE Download JSON" })] }), _jsxs("div", { className: "export-section", children: [_jsx("h3", { children: "Export as Image" }), _jsx("p", { children: "Save your pixel art as an image file" }), _jsxs("p", { className: "file-info", children: ["Size: ", model.width, "\u00D7", model.height, " pixels"] }), _jsxs("div", { className: "image-export-buttons", children: [_jsx("button", { onClick: handleExportPNG, disabled: isExporting, className: "export-button png-button", children: "\uD83D\uDDBC\uFE0F PNG" }), _jsx("button", { onClick: handleExportJPG, disabled: isExporting, className: "export-button jpg-button", children: "\uD83D\uDDBC\uFE0F JPG" }), _jsx("button", { onClick: handleExportWebP, disabled: isExporting, className: "export-button webp-button", children: "\uD83D\uDDBC\uFE0F WebP" })] })] }), _jsx("button", { onClick: onClose, className: "close-button", disabled: isExporting, children: "Cancel" })] }) }));
};
//# sourceMappingURL=ExportDialog.js.map