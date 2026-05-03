# Reset Pixel Art Tool - Architecture & Database Schema

## 1. System Architecture Overview

Reset is a full-stack web application with a layered, modular architecture designed for scalability and separation of concerns.

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React + TypeScript + Vite (Frontend SPA)             │  │
│  │ - Auth UI (login/register)                           │  │
│  │ - Canvas Editor (pixel manipulation)                 │  │
│  │ - Palette Manager                                    │  │
│  │ - File Manager                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST + JWT Bearer Tokens
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   API Layer (Express.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Application Server (Port 3000)                       │  │
│  │ - Authentication Middleware (JWT validation)         │  │
│  │ - CORS & Compression                                 │  │
│  │ - Swagger UI Docs (/api-docs)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌─────▼───────┐ ┌────▼────────────┐
│  Users Router  │ │ Files Router │ │ Health/Status   │
│  - Register    │ │ - Create    │ │ - /health       │
│  - Login       │ │ - CRUD Ops  │ └─────────────────┘
│  - Get Profile │ │ - Undo/Redo │
│  - Update      │ │ - Export    │
│  - Delete      │ └─────────────┘
└────────┬────────┘
         │
┌────────▼───────────────────────────────────────────────────┐
│             Business Logic Layer (Services)                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ FileService - File operations & state management    │ │
│  │ StorageService - Abstract I/O layer                 │ │
│  │ UserService - User management (implicit in models)  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│            Data Access Layer (Models & Persistence)        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ User Model - Account & file ownership metadata      │ │
│  │ ResetFile Model - Pixel art document + undo stack   │ │
│  │ Pixel Model - Individual pixel color data           │ │
│  │ PaletteColor Model - Palette entries                │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼────────┐  ┌────▼─────────┐
│  File Storage  │  │   MongoDB    │
│  (JSON files)  │  │   (optional) │
│  data/users/   │  │              │
│  data/files/   │  └──────────────┘
└────────────────┘
```

### 1.2 Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Axios
- **Backend:** Node.js, Express 5, TypeScript
- **Authentication:** JWT (jsonwebtoken)
- **Password:** bcrypt (password hashing)
- **Database:** 
  - Primary: JSON file-based storage
  - Optional: MongoDB + Mongoose
- **API Documentation:** Swagger UI + OpenAPI 3.0
- **Testing:** Jest, Supertest
- **Build:** TypeScript compiler (tsc)

---

## 2. Database Schema

### 2.1 Logical Data Model (ER Diagram)

```
┌─────────────────────────────────┐
│          USER                   │
├─────────────────────────────────┤
│ id (primary key, optional)      │
│ userName (unique, required)     │
│ email (required)                │
│ passwordHash (bcrypt, required) │
│ files[] (relationship to Files) │
└──────────┬──────────────────────┘
           │
           │ 1:N (one user has many files)
           │
           ├──────────────────────────────────────────────┐
           │                                              │
┌──────────▼──────────────────────────────────────────┐  │
│            RESET_FILE (Pixel Art Document)          │  │
├──────────────────────────────────────────────────────┤  │
│ fileName (unique per user, required)                │  │
│ owner (userName, foreign key)                       │  │
│ width (integer, required, 1-256)                    │  │
│ height (integer, required, 1-256)                   │  │
│ pixels[][] (2D array of Pixels)                     │  │
│ palette[] (array of PaletteColors)                  │  │
│ history[] (undo/redo stack of Models)               │  │
│ createdAt (timestamp)                               │  │
│ updatedAt (timestamp)                               │  │
└──────────┬──────────────────────────────────────────┘  │
           │                                              │
           │ 1:N (file has many pixels and palette)     │
           │                                              │
    ┌──────┴─────────────────────────┐                   │
    │                                │                   │
┌───▼──────────────────────┐  ┌─────▼──────────────────┐ │
│       PIXEL              │  │   PALETTE_COLOR        │ │
├──────────────────────────┤  ├────────────────────────┤ │
│ x (column, 0-255)        │  │ index (0-255)          │ │
│ y (row, 0-255)           │  │ red (0-255)            │ │
│ colorIndex (0-255)       │  │ green (0-255)          │ │
│ red (0-255)              │  │ blue (0-255)           │ │
│ green (0-255)            │  │ alpha (0-255)          │ │
│ blue (0-255)             │  │ (premultiplied or not) │ │
│ alpha (0-255)            │  └────────────────────────┘ │
└──────────────────────────┘                              │
                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 JSON File-Based Storage Schema

Files are stored in the `data/` directory with the following structure:

#### 2.2.1 User Storage (`data/users.json`)

```json
[
  {
    "userName": "testuser",
    "email": "testuser@example.com",
    "passwordHash": "$2b$10$...",
    "files": ["sprite1.json", "sprite2.json"]
  },
  {
    "userName": "edgeuser",
    "email": "edgeuser@example.com",
    "passwordHash": "$2b$10$...",
    "files": ["game_asset.json"]
  }
]
```

#### 2.2.2 File Storage (`data/{userName}/{fileName}.json`)

Example path: `data/testuser/sprite1.json`

```json
{
  "width": 32,
  "height": 32,
  "pixels": [
    [
      { "red": 255, "green": 0, "blue": 0, "alpha": 255 },
      { "red": 0, "green": 255, "blue": 0, "alpha": 255 },
      ...
    ],
    ...
  ],
  "palette": [
    { "red": 255, "green": 0, "blue": 0, "alpha": 255 },
    { "red": 0, "green": 255, "blue": 0, "alpha": 255 },
    { "red": 0, "green": 0, "blue": 255, "alpha": 255 }
  ]
}
```

### 2.3 MongoDB Schema (Optional)

When using MongoDB, the schema follows a similar structure but leverages Mongoose:

#### 2.3.1 User Collection

```typescript
db.users.insertOne({
  _id: ObjectId(...),
  userName: "testuser",
  email: "testuser@example.com",
  passwordHash: "$2b$10$...",
  files: ["sprite1", "sprite2"],
  createdAt: ISODate("2026-01-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-01T00:00:00Z")
})

// Index for fast lookups
db.users.createIndex({ userName: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

#### 2.3.2 ResetFile Collection

```typescript
db.resetfiles.insertOne({
  _id: ObjectId(...),
  fileName: "sprite1",
  owner: "testuser",
  width: 32,
  height: 32,
  pixels: [
    [
      { red: 255, green: 0, blue: 0, alpha: 255 },
      ...
    ],
    ...
  ],
  palette: [
    { red: 255, green: 0, blue: 0, alpha: 255 },
    ...
  ],
  createdAt: ISODate("2026-01-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-01T00:00:00Z")
})

// Compound index for user files
db.resetfiles.createIndex({ owner: 1, fileName: 1 }, { unique: true })
db.resetfiles.createIndex({ owner: 1 })
```

---

## 3. Data Models (TypeScript Interfaces)

### 3.1 User Model

```typescript
interface User {
  userName: string;              // Unique username
  email: string;                 // User email
  passwordHash: string;          // bcrypt hash
  files: string[];               // Array of file names owned by user
}
```

### 3.2 Pixel Art File Model

```typescript
interface Model {
  width: number;                 // Canvas width (1-256)
  height: number;                // Canvas height (1-256)
  pixels: Pixel[][];             // 2D array of pixels [y][x]
  palette: PaletteColor[];        // Array of colors
}
```

### 3.3 Pixel Model

```typescript
interface Pixel {
  red: number;                   // 0-255
  green: number;                 // 0-255
  blue: number;                  // 0-255
  alpha: number;                 // 0-255 (0=transparent, 255=opaque)
}
```

### 3.4 Palette Color Model

```typescript
interface PaletteColor {
  red: number;                   // 0-255
  green: number;                 // 0-255
  blue: number;                  // 0-255
  alpha: number;                 // 0-255
}
```

---

## 4. API Request/Response Flow

### 4.1 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/users (register) or /api/users/login
       │    { userName, password, email (optional) }
       │
       ▼
┌──────────────────────┐
│ UserController       │
│ - Hash password      │
│ - Verify credentials │
│ - Create JWT token   │
└──────────┬───────────┘
           │ 2. Response with JWT token
           │    { user, token: "eyJhb..." }
           │
       ┌───▼────────────┐
       │   Client       │
       │ (stores token  │
       │  in localStorage)
       │   and sends in
       │   Authorization
       │   header
       └────────────────┘
```

### 4.2 File Operation Flow

```
Client (Browser)
    │
    │ 1. Authorization: Bearer <JWT>
    │    GET /api/files/{fileName}
    │
    ▼
Express Middleware
    │ 2. authenticateToken()
    │    - Verify JWT signature
    │    - Extract userName from token
    │    - Attach to request
    │
    ▼
FileController
    │ 3. Route handler
    │    - Verify user owns file
    │    - Call FileService
    │
    ▼
FileService
    │ 4. Business logic
    │    - Load file from storage
    │    - Apply transformations if needed
    │    - Return Model
    │
    ▼
StorageService
    │ 5. I/O abstraction
    │    - Read from JSON OR MongoDB
    │    - Abstract storage backend
    │
    ▼
Persistent Storage (JSON or MongoDB)
    │ 6. Return data
    │
    ▼
FileService → FileController → Express → Client
```

---

## 5. Undo/Redo Architecture

The undo/redo system maintains a history stack of complete Model snapshots:

```typescript
class ResetFile {
  private history: Model[] = [];
  private currentIndex: number = -1;

  // After each mutation:
  // 1. Trim redo history
  // 2. Append new state to history
  // 3. Update currentIndex
  
  undo(): Model {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
  }

  redo(): Model {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
  }
}
```

Example history during edits:
```
history: [initial, state1, state2, state3]
                                  ▲
                            currentIndex (3)

After undo:
history: [initial, state1, state2, state3]
                  ▲
            currentIndex (2)

After redo:
history: [initial, state1, state2, state3]
                        ▲
                  currentIndex (1)

After new edit:
history: [initial, state1, newState]
                                  ▲
                            currentIndex (2)
```

---

## 6. Security Architecture

### 6.1 Authentication (JWT)

- **Token Issuance:** On login/register, server signs a JWT with a secret
- **Token Validation:** All protected routes verify the token's signature
- **Token Expiration:** Tokens expire after 7 days
- **Header Format:** `Authorization: Bearer <token>`

### 6.2 Password Security

- **Hashing:** bcrypt with salt rounds = 10
- **Storage:** Only hash stored, never plaintext
- **Comparison:** bcrypt.compare() for timing-safe verification

### 6.3 User Authorization

- **Self-Only Access:** Users can only modify their own files
- **Ownership Check:** Every file operation verifies owner == currentUser
- **CORS:** Configured to prevent unauthorized cross-domain requests

---

## 7. Deployment Architecture

### 7.1 Development

- Backend: `npm run dev` (ts-node, watches and recompiles)
- Frontend: `npm run dev` in `src/Frontend` (Vite dev server)

### 7.2 Production

- Backend: Built TypeScript (`npm run build`), served with `npm start`
- Frontend: Built SPA (`npm run build` in `src/Frontend`), deployed to CDN or static host
- Environment Variables:
  - `JWT_SECRET` - Secret key for token signing (REQUIRED)
  - `PORT` - Server port (default: 3000)
  - `USE_MONGODB` - Enable MongoDB (default: false)
  - `MONGODB_URI` - Connection string if using MongoDB

---

## 8. Scalability Considerations

### 8.1 Current Limitations (JSON Storage)

- Single-process, file-I/O bottleneck
- File locks would be needed for concurrent writes
- User isolation via filesystem directory structure

### 8.2 MongoDB Migration Path

1. Switch `USE_MONGODB=true`
2. Mongoose models auto-create collections
3. Drop-in replacement for StorageService
4. Adds multi-process support and horizontal scaling

### 8.3 Future Enhancements

- Add API rate limiting
- Cache recently accessed files
- Implement WebSocket for real-time collaboration
- Add file versioning and backups
- Migrate to object storage (S3) for large files

---

## 9. Summary

| Aspect | Details |
|--------|---------|
| **Architecture Pattern** | Layered (client → API → business logic → data access → storage) |
| **API Style** | RESTful with JWT authentication |
| **Authentication** | JWT bearer tokens, 7-day expiration |
| **Password Security** | bcrypt with 10 salt rounds |
| **Storage** | JSON files (primary) or MongoDB (optional) |
| **Undo/Redo** | History stack of complete Model snapshots |
| **User Authorization** | Self-only file access, verified per request |
| **Scalability** | File storage for single-node, MongoDB for multi-node |
