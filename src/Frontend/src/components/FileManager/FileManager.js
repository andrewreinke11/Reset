import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { fileService } from '../../services/api';
export const FileManager = ({ currentFile, onFileSelect, onFileCreate, onFileDelete }) => {
    const [files, setFiles] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileWidth, setNewFileWidth] = useState(32);
    const [newFileHeight, setNewFileHeight] = useState(32);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadFiles();
    }, []);
    const loadFiles = async () => {
        try {
            const fileList = await fileService.listFiles();
            setFiles(fileList);
        }
        catch (error) {
            console.error('Failed to load files:', error);
        }
    };
    const handleCreateFile = async () => {
        if (!newFileName.trim())
            return;
        setLoading(true);
        try {
            await fileService.createFile(newFileName, newFileWidth, newFileHeight);
            setNewFileName('');
            setShowCreateForm(false);
            await loadFiles();
            onFileCreate(newFileName, newFileWidth, newFileHeight);
        }
        catch (error) {
            console.error('Failed to create file:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteFile = async (fileName) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"?`))
            return;
        try {
            await fileService.deleteFile(fileName);
            await loadFiles();
            if (currentFile === fileName) {
                onFileDelete(fileName);
            }
        }
        catch (error) {
            console.error('Failed to delete file:', error);
        }
    };
    return (_jsxs("div", { className: "file-manager", children: [_jsx("h3", { children: "File Manager" }), _jsx("div", { className: "file-list", children: files.map(fileName => (_jsxs("div", { className: `file-item ${currentFile === fileName ? 'active' : ''}`, children: [_jsx("span", { onClick: () => onFileSelect(fileName), children: fileName }), _jsx("button", { onClick: () => handleDeleteFile(fileName), children: "Delete" })] }, fileName))) }), !showCreateForm ? (_jsx("button", { onClick: () => setShowCreateForm(true), children: "Create New File" })) : (_jsxs("div", { className: "create-file-form", children: [_jsx("input", { type: "text", placeholder: "File name", value: newFileName, onChange: (e) => setNewFileName(e.target.value) }), _jsx("input", { type: "number", placeholder: "Width", value: newFileWidth, onChange: (e) => setNewFileWidth(Number(e.target.value)), min: "1", max: "256" }), _jsx("input", { type: "number", placeholder: "Height", value: newFileHeight, onChange: (e) => setNewFileHeight(Number(e.target.value)), min: "1", max: "256" }), _jsx("button", { onClick: handleCreateFile, disabled: loading, children: loading ? 'Creating...' : 'Create' }), _jsx("button", { onClick: () => setShowCreateForm(false), children: "Cancel" })] }))] }));
};
//# sourceMappingURL=FileManager.js.map