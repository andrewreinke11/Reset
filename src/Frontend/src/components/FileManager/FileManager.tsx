import { useState, useEffect } from 'react';
import { fileService } from '../../services/api';

interface FileManagerProps {
  currentFile: string | null;
  onFileSelect: (fileName: string) => void;
  onFileCreate: (fileName: string, width: number, height: number) => void;
  onFileDelete: (fileName: string) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  currentFile,
  onFileSelect,
  onFileCreate,
  onFileDelete
}) => {
  const [files, setFiles] = useState<string[]>([]);
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
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    setLoading(true);
    try {
      await fileService.createFile(newFileName, newFileWidth, newFileHeight);
      setNewFileName('');
      setShowCreateForm(false);
      await loadFiles();
      onFileCreate(newFileName, newFileWidth, newFileHeight);
    } catch (error) {
      console.error('Failed to create file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      await fileService.deleteFile(fileName);
      await loadFiles();
      if (currentFile === fileName) {
        onFileDelete(fileName);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="file-manager">
      <h3>File Manager</h3>

      <div className="file-list">
        {files.map(fileName => (
          <div key={fileName} className={`file-item ${currentFile === fileName ? 'active' : ''}`}>
            <span
              onClick={() => onFileSelect(fileName)}
              title={`Open ${fileName} for editing`}
              style={{ cursor: 'pointer' }}
            >
              {fileName}
            </span>
            <button
              onClick={() => handleDeleteFile(fileName)}
              title={`Delete ${fileName} from your workspace`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)} title="Create a new pixel art file">
          Create New File
        </button>
      ) : (
        <div className="create-file-form">
          <input
            type="text"
            placeholder="File name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            title="Choose a unique file name"
          />
          <input
            type="number"
            placeholder="Width"
            value={newFileWidth}
            onChange={(e) => setNewFileWidth(Number(e.target.value))}
            min="1"
            max="256"
            title="Set the canvas width in pixels"
          />
          <input
            type="number"
            placeholder="Height"
            value={newFileHeight}
            onChange={(e) => setNewFileHeight(Number(e.target.value))}
            min="1"
            max="256"
            title="Set the canvas height in pixels"
          />
          <button onClick={handleCreateFile} disabled={loading} title="Create the file with the chosen dimensions">
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button onClick={() => setShowCreateForm(false)} title="Close the new file form">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};