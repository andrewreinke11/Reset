import { useState } from 'react';
import { exportModelAsJSON, exportModelAsPNG, exportModelAsJPG, exportModelAsWebP } from '../../services/exportService';
import type { Model } from '../../types';
import './ExportDialog.css';

interface ExportDialogProps {
  model: Model;
  fileName: string;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ model, fileName, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      exportModelAsJSON(model, fileName);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export JSON');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      exportModelAsPNG(model, fileName);
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportJPG = async () => {
    try {
      setIsExporting(true);
      exportModelAsJPG(model, fileName);
    } catch (error) {
      console.error('Failed to export JPG:', error);
      alert('Failed to export JPG');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportWebP = async () => {
    try {
      setIsExporting(true);
      exportModelAsWebP(model, fileName);
    } catch (error) {
      console.error('Failed to export WebP:', error);
      alert('Failed to export WebP');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="export-dialog-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Export File</h2>
        
        <div className="export-section">
          <h3>Export as JSON</h3>
          <p>Save your pixel art data in JSON format for later editing</p>
          <p className="file-info">
            Format: Text (editable)
          </p>
          <button 
            onClick={handleExportJSON} 
            disabled={isExporting}
            className="export-button json-button"
          >
            💾 Download JSON
          </button>
        </div>

        <div className="export-section">
          <h3>Export as Image</h3>
          <p>Save your pixel art as an image file</p>
          <p className="file-info">
            Size: {model.width}×{model.height} pixels
          </p>
          <div className="image-export-buttons">
            <button 
              onClick={handleExportPNG} 
              disabled={isExporting}
              className="export-button png-button"
            >
              🖼️ PNG
            </button>
            <button 
              onClick={handleExportJPG} 
              disabled={isExporting}
              className="export-button jpg-button"
            >
              🖼️ JPG
            </button>
            <button 
              onClick={handleExportWebP} 
              disabled={isExporting}
              className="export-button webp-button"
            >
              🖼️ WebP
            </button>
          </div>
        </div>

        <button onClick={onClose} className="close-button" disabled={isExporting}>
          Cancel
        </button>
      </div>
    </div>
  );
};
