# Reset - Pixel Art Tool

A full-stack web application for creating and editing pixel art, built with modern web technologies.

## Overview

Reset is a comprehensive pixel art tool that allows users to:
- Create and edit pixel art with an intuitive canvas interface
- Manage color palettes with unlimited colors
- Save and load multiple art files
- Undo and redo operations with full history support
- User authentication and file ownership

## Architecture

The application consists of two main parts:

### Backend (Node.js + Express + TypeScript)
- **Location**: `src/` (Controllers, models, services)
- **Features**: RESTful API, user management, file operations, persistent storage
- **Tech Stack**: Node.js, Express, TypeScript, bcrypt, file system

### Frontend (React + TypeScript + Vite)
- **Location**: `src/Frontend/`
- **Features**: Interactive canvas, authentication UI, file management
- **Tech Stack**: React, TypeScript, Vite, Axios, CSS

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the root directory:
   ```bash
   cd Reset
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd src/Frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## API Documentation

### Authentication Endpoints

- `POST /api/users` - Register a new user
- Authentication is handled via headers (`x-user-name`)

### File Endpoints

All file operations require user authentication:

- `POST /api/files/create` - Create a new pixel art file
- `GET /api/files` - List user's files
- `GET /api/files/:fileName` - Get file data
- `PUT /api/files/:fileName/pixel` - Recolor a pixel
- `POST /api/files/:fileName/palette/add` - Add color to palette
- `PUT /api/files/:fileName/palette/:colorIndex` - Update palette color
- `POST /api/files/:fileName/undo` - Undo last operation
- `POST /api/files/:fileName/redo` - Redo last operation
- `DELETE /api/files/:fileName` - Delete a file

## Data Models

### User
```typescript
interface User {
  userName: string;
  email: string;
  files: string[]; // Array of file names
}
```

### Pixel Art Model
```typescript
interface Model {
  width: number;
  height: number;
  pixels: Pixel[][];
  palette: PaletteColor[];
}
```

## Development

### Backend
- Uses TypeScript for type safety
- File-based storage in JSON format
- Password hashing with bcrypt
- RESTful API design

### Frontend
- Modern React with hooks
- TypeScript for type safety
- Canvas API for pixel art rendering
- Responsive design

## File Storage

Files are stored in the `data/{userName}/` directory as JSON files, with each user having their own isolated directory.

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Test API endpoints thoroughly
4. Update documentation for new features

## License

ISC