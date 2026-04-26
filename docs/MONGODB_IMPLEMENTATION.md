# MongoDB Integration Implementation Summary

## Overview

MongoDB integration has been successfully implemented for the Reset Pixel Art Tool. The application now supports persistent data storage using MongoDB while maintaining backward compatibility with JSON file-based storage.

## Files Created/Modified

### Configuration & Connection
- **`src/config/mongo.ts`** - MongoDB connection setup with Mongoose
- **`.env`** - Environment configuration with MongoDB URI
- **`src/scripts/migrate.ts`** - Migration utility to transfer data from JSON to MongoDB

### Database Schemas
- **`src/models/schemas/UserSchema.ts`** - Mongoose User schema with username (unique), password, email, and files array
- **`src/models/schemas/FileSchema.ts`** - Mongoose File schema with pixel art data, palette, and undo/redo history

### Services
- **`src/services/MongoFileService.ts`** - Full MongoDB-based implementation of file operations
  - CRUD operations for pixel art files
  - Undo/redo functionality using history array
  - Palette and pixel manipulation
  - Async/await for database operations

### Controllers
- **`src/Controllers/MongoUserController.ts`** - Async user management with MongoDB
  - User registration and authentication
  - User CRUD operations
  - Password hashing with bcrypt
  
- **`src/Controllers/MongoFileController.ts`** - Async file management with MongoDB
  - Create, read, update, delete files
  - Palette and pixel operations
  - Undo/redo endpoints

### Server Updates
- **`src/server.ts`** - Added MongoDB connection initialization
- **`package.json`** - Added npm scripts: `dev`, `start`, `build`, `test`, `migrate`

### Documentation
- **`docs/MONGODB_SETUP.md`** - Comprehensive MongoDB setup and usage guide

## Key Features

### 1. **Dual Storage Support**
- Use MongoDB when `USE_MONGODB=true` in `.env`
- Fall back to JSON file storage when `USE_MONGODB=false` (default)
- Allows gradual migration

### 2. **Mongoose Schemas**

**UserSchema:**
```typescript
{
  username: string (unique, required)
  password: string (hashed, required)
  email: string (optional)
  files: string[] (array of filenames)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**FileSchema:**
```typescript
{
  username: string (indexed)
  filename: string (indexed)
  width: number (8-1024)
  height: number (8-1024)
  palette: Array<{r, g, b}> (color values)
  pixels: Array<{x, y, colorIndex}> (sparse pixel array)
  history: Array<{pixels, palette}> (undo/redo states)
  historyIndex: number (current position in history)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 3. **Data Format Conversion**

The implementation handles conversion between:
- **Frontend Model**: 2D pixel array + palette with full color objects
- **MongoDB Storage**: Sparse 1D pixel array (only stores non-transparent pixels) + RGB palette

This reduces storage requirements while maintaining full functionality.

### 4. **Async Operations**

All MongoDB operations are async:
- `getUserFile(userName, fileName): Promise<ResetFile | undefined>`
- `createFile(userName, fileName, width, height): Promise<ResetFile>`
- `addColorToPalette(...): Promise<void>`
- `recolorPixel(...): Promise<void>`
- `undo/redo(...): Promise<Model>`
- `deleteFile(...): Promise<void>`
- `listUserFiles(userName): Promise<string[]>`

### 5. **Data Migration**

Run migration to transfer existing JSON data to MongoDB:
```bash
npm run migrate
```

Features:
- Non-destructive (original JSON files remain)
- Converts pixel format automatically
- Preserves undo/redo history
- Reports migration status

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB
**Local Option:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
systemctl start mongod
```

**Atlas Option:**
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `.env`

### 3. Configure Environment
```env
mongodb_URI=mongodb://localhost:27017/reset
USE_MONGODB=true
NODE_ENV=development
```

### 4. Run Server
```bash
npm run dev
```

Server will connect to MongoDB and log:
```
MongoDB connected successfully
Reset Pixel Art Tool API listening on port 3000
```

### 5. (Optional) Migrate Existing Data
If you have existing JSON files:
```bash
npm run migrate
```

## API Usage

All endpoints remain the same as before. Use `x-user-name` header or include `userName` in request body.

**Example: Create File**
```bash
POST /api/files/create
Content-Type: application/json
x-user-name: artist

{
  "fileName": "my-art",
  "width": 64,
  "height": 64
}
```

**Example: Draw Pixel**
```bash
PUT /api/files/my-art/pixel
Content-Type: application/json
x-user-name: artist

{
  "x": 10,
  "y": 20,
  "colorIndex": 0
}
```

## Architecture

```
┌─────────────────────────────┐
│   Frontend (React/Vite)     │
└──────────────┬──────────────┘
               │ HTTP/API
┌──────────────▼──────────────┐
│   Express.js Controllers    │
│  MongoUserController        │
│  MongoFileController        │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   MongoFileService          │
│   Data transformation       │
└──────────────┬──────────────┘
               │ Mongoose
┌──────────────▼──────────────┐
│    MongoDB Database         │
│  - Users Collection         │
│  - Files Collection         │
└─────────────────────────────┘
```

## Performance Optimizations

1. **Sparse Pixel Storage**: Only non-transparent pixels stored
2. **Indexed Queries**: Username and filename indexed for fast lookups
3. **Compound Indexes**: (username, filename) ensures uniqueness
4. **Connection Pooling**: Mongoose handles connection pooling automatically

## Features

### Supported Operations
✅ User registration and authentication
✅ Create/read/delete pixel art files
✅ Draw/recolor pixels
✅ Palette management (add, update colors)
✅ Undo/redo with full history preservation
✅ File listing per user
✅ Data persistence across sessions

### Limitations
- History is not synced back to JSON (JSON remains as fallback)
- Migration is one-way (can't export to JSON)
- No distributed transactions needed (single user per file)

## Troubleshooting

**Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running (see Getting Started -> Set Up MongoDB)

**Authentication Failed (Atlas)**
```
Error: authentication failed
```
Solution:
- Verify username/password in connection string
- Check IP whitelist in Atlas settings
- Url-encode special password characters

**Migration Errors**
```
Error migrating user "username": ...
```
Solution:
- Check `/data` directory permissions
- Verify JSON file format is valid
- Run with `USE_MONGODB=true` in `.env`

## Next Steps

1. **Test with Real Data**: Run application and create test files
2. **Performance Testing**: Monitor MongoDB Atlas metrics
3. **Backup Strategy**: Set up MongoDB backup procedures
4. **Production Deployment**: Use MongoDB Atlas with proper authentication
5. **Monitoring**: Enable MongoDB performance monitoring

## References

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Guide](https://expressjs.com/)
