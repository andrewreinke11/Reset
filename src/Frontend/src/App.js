import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Auth } from './components/Auth/Auth';
import { Canvas } from './components/Canvas/Canvas';
import { Palette } from './components/Canvas/Palette';
import { FileManager } from './components/FileManager/FileManager';
import { ExportDialog } from './components/ExportDialog/ExportDialog';
import { authService, fileService } from './services/api';
import './App.css';
function App() {
    const [userName, setUserName] = useState(null);
    const [currentFile, setCurrentFile] = useState(null);
    const [currentModel, setCurrentModel] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        if (savedUser) {
            setUserName(savedUser);
        }
    }, []);
    const handleAuth = (user) => {
        setUserName(user);
    };
    const handleLogout = () => {
        authService.logout();
        setUserName(null);
        setCurrentFile(null);
        setCurrentModel(null);
    };
    const handleFileSelect = async (fileName) => {
        setLoading(true);
        try {
            const response = await fileService.getFile(fileName);
            setCurrentFile(fileName);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to load file:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFileCreate = async (fileName, width, height) => {
        setLoading(true);
        try {
            const model = await fileService.createFile(fileName, width, height);
            setCurrentFile(fileName);
            setCurrentModel(model);
            setCanUndo(false);
            setCanRedo(false);
        }
        catch (error) {
            console.error('Failed to create file:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFileDelete = (fileName) => {
        if (currentFile === fileName) {
            setCurrentFile(null);
            setCurrentModel(null);
            setCanUndo(false);
            setCanRedo(false);
        }
    };
    const handlePixelClick = async (x, y) => {
        if (!currentFile || !currentModel)
            return;
        setLoading(true);
        try {
            const response = await fileService.recolorPixel(currentFile, x, y, selectedColorIndex);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to recolor pixel:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddColor = async (red, green, blue, alpha = 255) => {
        if (!currentFile)
            return;
        setLoading(true);
        try {
            const response = await fileService.addColorToPalette(currentFile, red, green, blue, alpha);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to add color:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdatePaletteColor = async (colorIndex, red, green, blue, alpha = 255) => {
        if (!currentFile)
            return;
        setLoading(true);
        try {
            const response = await fileService.updatePaletteColor(currentFile, colorIndex, red, green, blue, alpha);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to update palette color:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUndo = async () => {
        if (!currentFile || !canUndo)
            return;
        setLoading(true);
        try {
            const response = await fileService.undo(currentFile);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to undo:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRedo = async () => {
        if (!currentFile || !canRedo)
            return;
        setLoading(true);
        try {
            const response = await fileService.redo(currentFile);
            setCurrentModel(response.model);
            setCanUndo(response.canUndo);
            setCanRedo(response.canRedo);
        }
        catch (error) {
            console.error('Failed to redo:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (!userName) {
        return (_jsx("div", { className: "app", children: _jsx(Auth, { onAuth: handleAuth }) }));
    }
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { children: [_jsx("h1", { children: "Reset - Pixel Art Tool" }), _jsxs("div", { className: "user-info", children: [_jsxs("span", { children: ["Welcome, ", userName, "!"] }), _jsx("button", { onClick: handleLogout, children: "Logout" })] })] }), _jsxs("div", { className: "main-content", children: [_jsxs("div", { className: "sidebar", children: [_jsx(FileManager, { currentFile: currentFile, onFileSelect: handleFileSelect, onFileCreate: handleFileCreate, onFileDelete: handleFileDelete }), currentModel && (_jsx(Palette, { palette: currentModel.palette, selectedColorIndex: selectedColorIndex, onColorSelect: setSelectedColorIndex, onAddColor: handleAddColor, onUpdateColor: handleUpdatePaletteColor }))] }), _jsx("div", { className: "canvas-area", children: currentModel ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "canvas-toolbar", children: [_jsx("h2", { children: currentFile }), _jsxs("div", { className: "toolbar-buttons", children: [_jsx("button", { onClick: handleUndo, disabled: !canUndo || loading, children: "Undo" }), _jsx("button", { onClick: handleRedo, disabled: !canRedo || loading, children: "Redo" }), _jsx("button", { onClick: () => setShowExportDialog(true), disabled: loading, children: "\uD83D\uDCE5 Export" })] })] }), _jsx(Canvas, { model: currentModel, onPixelClick: handlePixelClick, selectedColorIndex: selectedColorIndex })] })) : (_jsx("div", { className: "no-file-selected", children: _jsx("p", { children: "Select or create a file to start editing" }) })) })] }), showExportDialog && currentModel && currentFile && (_jsx(ExportDialog, { model: currentModel, fileName: currentFile, onClose: () => setShowExportDialog(false) }))] }));
}
export default App;
//# sourceMappingURL=App.js.map