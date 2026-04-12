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

- **React 19.2.4** - Modern React with hooks and JSX
- **TypeScript** - Type-safe development with strict mode enabled
- **Vite** - Lightning-fast build tool with HMR (Hot Module Replacement)
- **Axios** - Promise-based HTTP client for API communication
- **CSS Modules** - Scoped styling to prevent class name conflicts

### Key Features

- **Module Resolution**: ES modules with proper import/export handling
- **Source Maps**: Debug TypeScript directly in browser DevTools
- **JSX Support**: React 18+ automatic runtime JSX transformation
- **ESM Modules**: Native ES modules throughout the application

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- **Backend must be running** on `http://localhost:3000`

### Installation

1. **Start the backend first** (from project root):
   ```bash
   npm start
   ```
   
   Expected output:
   ```
   MongoDB connected successfully
   Reset Pixel Art Tool API listening on port 3000
   ```

2. **In a new terminal, navigate to the frontend directory:**
   ```bash
   cd src/Frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser to `http://localhost:5173`**

   The frontend will automatically connect to the backend at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Configuration

The frontend connects to the backend via the `api.ts` service. To change the backend URL, edit [src/services/api.ts](src/services/api.ts):

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
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

The frontend communicates with the Reset backend API via the service layer in [src/services/api.ts](src/services/api.ts).

### Key Services

- **authService** - User registration and authentication
- **fileService** - File operations (create, read, update, delete, palette management)

### Authentication

The frontend uses header-based authentication (`x-user-name`) to identify the current user. After login/registration, the username is stored and sent with every API request.

### Error Handling

- Failed API requests display user-friendly error messages
- Network errors are handled gracefully with notifications
- Invalid credentials prevent navigation to the canvas

### Data Synchronization

- All pixel changes are immediately sent to the backend
- File list updates automatically when files are created or deleted
- Undo/redo operations maintain consistency with the backend

## Usage

1. **Authentication**:
   - Register a new account or login with existing credentials
   - Your session persists within the current browser session

2. **Create Files**:
   - Use the File Manager to create new pixel art files
   - Specify width and height for the canvas
   - Files are created with a default color palette

3. **Edit Pixels**:
   - Click on canvas pixels to recolor them with the selected palette color
   - Each pixel is stored individually for efficient storage
   - Changes are instantly saved to the backend

4. **Manage Colors**:
   - View and select colors from the palette
   - Add new custom colors to expand your creative options
   - Colors are stored in hex format

5. **Undo/Redo**:
   - Use toolbar buttons to undo and redo operations with full history
   - Undo/redo state is maintained per file

6. **Manage Files**:
   - Load existing files to continue editing
   - Delete files you no longer need
   - All files are associated with your user account

## Development

### Code Quality

- **TypeScript**: Complete type safety for all props, state, and API responses
- **ESLint**: Code linting for consistency (enabled in build)
- **Hot Module Replacement (HMR)**: Instant feedback during development with Vite

### Component Architecture

- **Auth.tsx**: Handles login/registration UI and flow
- **Canvas.tsx**: Main drawing canvas with pixel-by-pixel input
- **Palette.tsx**: Color palette display and management
- **FileManager.tsx**: File list, creation, and deletion
- **ExportDialog.tsx**: Export artwork to multiple formats (JSON, PNG, JPG, WebP)

### Type Safety

- All API responses are typed
- Component props use TypeScript interfaces
- Shared types defined in [src/types/index.ts](src/types/index.ts)

### Browser DevTools

- React Developer Tools extension provides component inspection
- Network tab shows API requests and responses
- Console logs provide debugging information

## Troubleshooting

### Backend Connection Issues

**Problem**: "Failed to connect to backend" or "Network Error"

**Solution**:
1. Verify the backend is running: Open `http://localhost:3000` in your browser
2. Check backend terminal for error messages
3. Restart both backend and frontend

### Port Already in Use

**Problem**: "Port 5173 is already in use"

**Solution**:
```bash
# Kill the process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or run on a different port
npm run dev -- --port 5174
```

### Login Not Working

**Problem**: Cannot login or register

**Solution**:
1. Clear browser localStorage: Open DevTools → Storage → Clear All
2. Restart the application
3. Check backend logs for authentication errors
4. Ensure `.env` file is properly configured

### Canvas Not Rendering

**Problem**: Blank canvas or pixels not appearing

**Solution**:
1. Open browser DevTools → Console for errors
2. Check Network tab for failed API requests
3. Verify file was created successfully in File Manager
4. Try refreshing the page

### Build Failures

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clean and rebuild
rm -r dist/
npm run build
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes with the backend API
4. Update this README for any new features