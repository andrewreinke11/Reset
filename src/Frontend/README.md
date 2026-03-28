# Reset Pixel Art Tool - Frontend

A modern React TypeScript frontend for the Reset pixel art tool, built with Vite.

## Features

- **User Authentication**: Login and registration with backend integration
- **Canvas-based Pixel Art Editor**: Interactive pixel art creation and editing
- **Color Palette Management**: Add, select, and manage colors for your artwork
- **File Management**: Create, load, and delete pixel art files
- **Undo/Redo**: Full history support for pixel art operations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API communication
- **CSS Modules** - Scoped styling

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd src/Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Auth.tsx          # Login/Register component
│   ├── Canvas/
│   │   ├── Canvas.tsx        # Main canvas component
│   │   └── Palette.tsx       # Color palette component
│   └── FileManager/
│       └── FileManager.tsx   # File operations component
├── services/
│   └── api.ts                # API client and service functions
├── types/
│   └── index.ts              # TypeScript type definitions
├── App.tsx                   # Main application component
├── App.css                   # Application styles
├── main.tsx                  # Application entry point
└── index.css                 # Global styles
```

## API Integration

The frontend communicates with the Reset backend API running on `http://localhost:3000`. Make sure the backend is running before using the frontend.

## Usage

1. **Authentication**: Register or login with your credentials
2. **Create Files**: Use the file manager to create new pixel art files
3. **Edit Pixels**: Click on the canvas to recolor pixels with the selected palette color
4. **Manage Colors**: Add new colors to your palette for more creative options
5. **Undo/Redo**: Use the toolbar buttons to undo and redo changes
6. **Save Files**: All changes are automatically saved to the backend

## Development

- The project uses ESLint for code linting
- TypeScript provides type checking
- Hot module replacement is enabled for fast development

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes with the backend API
4. Update this README for any new features