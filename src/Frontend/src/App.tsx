import { useState, useEffect } from 'react';
import { Auth } from './components/Auth/Auth';
import { Canvas } from './components/Canvas/Canvas';
import { Palette } from './components/Canvas/Palette';
import { FileManager } from './components/FileManager/FileManager';
import { authService, fileService } from './services/api';
import { Model, FileResponse } from './types';
import './App.css';

function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUserName(savedUser);
    }
  }, []);

  const handleAuth = (user: string) => {
    setUserName(user);
  };

  const handleLogout = () => {
    authService.logout();
    setUserName(null);
    setCurrentFile(null);
    setCurrentModel(null);
  };

  const handleFileSelect = async (fileName: string) => {
    setLoading(true);
    try {
      const response: FileResponse = await fileService.getFile(fileName);
      setCurrentFile(fileName);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to load file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileCreate = async (fileName: string, width: number, height: number) => {
    setLoading(true);
    try {
      const model = await fileService.createFile(fileName, width, height);
      setCurrentFile(fileName);
      setCurrentModel(model);
      setCanUndo(false);
      setCanRedo(false);
    } catch (error) {
      console.error('Failed to create file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = (fileName: string) => {
    if (currentFile === fileName) {
      setCurrentFile(null);
      setCurrentModel(null);
      setCanUndo(false);
      setCanRedo(false);
    }
  };

  const handlePixelClick = async (x: number, y: number) => {
    if (!currentFile || !currentModel) return;

    setLoading(true);
    try {
      const response = await fileService.recolorPixel(currentFile, x, y, selectedColorIndex);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to recolor pixel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = async (red: number, green: number, blue: number, alpha: number = 255) => {
    if (!currentFile) return;

    setLoading(true);
    try {
      const response = await fileService.addColorToPalette(currentFile, red, green, blue, alpha);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to add color:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaletteColor = async (colorIndex: number, red: number, green: number, blue: number, alpha: number = 255) => {
    if (!currentFile) return;

    setLoading(true);
    try {
      const response = await fileService.updatePaletteColor(currentFile, colorIndex, red, green, blue, alpha);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to update palette color:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!currentFile || !canUndo) return;

    setLoading(true);
    try {
      const response = await fileService.undo(currentFile);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to undo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    if (!currentFile || !canRedo) return;

    setLoading(true);
    try {
      const response = await fileService.redo(currentFile);
      setCurrentModel(response.model);
      setCanUndo(response.canUndo);
      setCanRedo(response.canRedo);
    } catch (error) {
      console.error('Failed to redo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userName) {
    return (
      <div className="app">
        <Auth onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Reset - Pixel Art Tool</h1>
        <div className="user-info">
          <span>Welcome, {userName}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar">
          <FileManager
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
          />

          {currentModel && (
            <Palette
              palette={currentModel.palette}
              selectedColorIndex={selectedColorIndex}
              onColorSelect={setSelectedColorIndex}
              onAddColor={handleAddColor}
              onUpdateColor={handleUpdatePaletteColor}
            />
          )}
        </div>

        <div className="canvas-area">
          {currentModel ? (
            <>
              <div className="canvas-toolbar">
                <h2>{currentFile}</h2>
                <div className="toolbar-buttons">
                  <button onClick={handleUndo} disabled={!canUndo || loading}>
                    Undo
                  </button>
                  <button onClick={handleRedo} disabled={!canRedo || loading}>
                    Redo
                  </button>
                </div>
              </div>
              <Canvas
                model={currentModel}
                onPixelClick={handlePixelClick}
                selectedColorIndex={selectedColorIndex}
              />
            </>
          ) : (
            <div className="no-file-selected">
              <p>Select or create a file to start editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;