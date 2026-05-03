import mongoose, { Schema, Document } from 'mongoose';

interface PaletteColor {
  r: number;
  g: number;
  b: number;
}

interface Pixel {
  x: number;
  y: number;
  colorIndex: number;
}

interface UndoRedoState {
  pixels: Pixel[];
  palette: PaletteColor[];
}

export interface IFile extends Document {
  username: string;
  filename: string;
  width: number;
  height: number;
  palette: PaletteColor[];
  pixels: Pixel[];
  history: UndoRedoState[];
  historyIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaletteColorSchema = new Schema({
  r: { type: Number, required: true, min: 0, max: 255 },
  g: { type: Number, required: true, min: 0, max: 255 },
  b: { type: Number, required: true, min: 0, max: 255 }
}, { _id: false });

const PixelSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  colorIndex: { type: Number, required: true, min: 0 }
}, { _id: false });

const UndoRedoStateSchema = new Schema({
  pixels: [PixelSchema],
  palette: [PaletteColorSchema]
}, { _id: false });

const FileSchema = new Schema<IFile>(
  {
    username: {
      type: String,
      required: true,
      index: true
    },
    filename: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: true,
      min: 8,
      max: 1024
    },
    height: {
      type: Number,
      required: true,
      min: 8,
      max: 1024
    },
    palette: {
      type: [PaletteColorSchema],
      default: []
    },
    pixels: {
      type: [PixelSchema],
      default: []
    },
    history: {
      type: [UndoRedoStateSchema],
      default: []
    },
    historyIndex: {
      type: Number,
      default: -1
    }
  },
  {
    timestamps: true
  }
);

// Compound index for username + filename uniqueness
FileSchema.index({ username: 1, filename: 1 }, { unique: true });

export const FileModel = mongoose.model<IFile>('File', FileSchema);
