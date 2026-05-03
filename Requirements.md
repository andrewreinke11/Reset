# Reset - Project Requirements & User Stories (Revised)

## Vision Statement
For game studios who need to produce pixel art, Reset is an image editing program that is specifically designed for the task. Unlike Photoshop or GIMP, our product is cost-effective, simple to use, and provides a convenient system for color organization.

---

## SMART User Stories & Acceptance Criteria

### **1. Jan — Artist at a Large Studio**

**User Story:**
As an artist at a large studio, I need the web-based Reset tool to provide an intuitive interface for pixel art creation with efficient palette and pixel editing operations, so I can reliably meet my weekly production quotas.

**Acceptance Criteria:**
- [x] Can create a new pixel art file and add 5+ colors to palette
- [x] Undo/redo functionality with 50+ action history
- [x] Can select and paint pixels efficiently through UI
- [x] File operations (create, list, delete) work correctly
- [x] Session persistence allows work to be saved between sessions

**Feature Mapping (Current Status):**
| Feature | Status | Code Location |
|---------|--------|---------------|
| File creation | ✅ Implemented | `src/Controllers/FileController.ts` |
| Palette management | ✅ Implemented | `src/Controllers/FileController.ts` |
| Pixel editing | ✅ Implemented | `src/Controllers/FileController.ts` |
| Undo/redo (50+ stack) | ✅ Implemented | `src/Models/ResetFile.ts` |
| Persistent storage | ✅ Implemented | `src/services/FileService.ts` |

---

### **2. Luke — Solo Indie Developer**

**User Story:**
As a solo indie developer, I need an intuitive, pixel-accurate sprite editor accessible from any browser that allows me to create, save, and manage multiple sprite files within a single project workspace, so I can focus more time on building my game logic.

**Acceptance Criteria:**
- [x] Can create multiple sprite files and list them
- [x] Pixel-perfect 1:1 drawing support
- [x] Can load and resume work on previously saved files
- [x] Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- [x] No installation required for end users

**Feature Mapping (Current Status):**
| Feature | Status | Code Location |
|---------|--------|---------------|
| Multi-file management | ✅ Implemented | `src/Controllers/FileController.ts` |
| File persistence | ✅ Implemented | `src/services/FileService.ts` |
| Browser compatibility | ✅ React/Vite | `src/Frontend/vite.config.ts` |
| File listing/retrieval | ✅ Implemented | `src/Controllers/FileController.ts` |

---

### **3. Linda — Freelance Consultant**

**User Story:**
As a freelance consultant, I need to create pixel art in Reset and export files in PNG and JSON formats, so I can share assets with different studio pipelines and version control systems (Git).

**Acceptance Criteria:**
- [x] Export as PNG with preserved transparency and correct pixel dimensions
- [x] Export as JSON containing pixel data and palette information
- [x] Export operations complete in <2 seconds
- [x] Exported files are valid and can be re-imported by Reset
- [x] PNG files are Git-friendly (binary format)

**Feature Mapping (Current Status):**
| Feature | Status | Code Location |
|---------|--------|---------------|
| PNG export | ✅ Implemented | `src/Controllers/FileController.ts` |
| JSON export | ✅ Implemented | `src/services/FileService.ts` |
| Import functionality | ✅ Implemented | `src/Controllers/FileController.ts` |
| File format validation | ✅ Implemented | `src/Models/ResetFile.ts` |

---

### **4. George — Manager at a Large Studio**

**User Story:**
As a manager at a large studio, I need new team members to create their first pixel art file and understand the undo/redo workflow within a reasonable onboarding time, without requiring installation or local setup, so they can begin contributing to production tasks quickly.

**Acceptance Criteria:**
- [x] Login page is accessible and functional
- [x ] User can create first file with minimal confusion
- [x] Undo/redo buttons are present and functional
- [x] In-app help/tooltips explain each feature
- [x] Clear UI communication of file status and available operations

**Feature Mapping (Current Status):**
| Feature | Status | Code Location |
|---------|--------|---------------|
| User authentication | ✅ Implemented | `src/Controllers/UserController.ts` |
| No installation required | ✅ Web-based | Architecture is web-first |
| Undo/redo visibility | ✅ Implemented | Frontend canvas |
| UI clarity | ⚠️ Partial | Frontend needs UX review in `src/Frontend/src/App.tsx` |
| In-app tooltips/help | ⚠️ Partial | Needs enhancement |

---

### **5. Greg — Accountant**

**User Story:**
As an accountant, I need the web-based Reset tool to offer a cost-effective alternative to expensive software subscriptions and support multiple concurrent users through a single server instance, so I can justify the investment to stakeholders.

**Acceptance Criteria:**
- [x] Zero licensing fees (free deployment)
- [x] Server architecture supports multiple concurrent users
- [x] User isolation ensures data privacy
- [x] Persistent storage minimizes infrastructure overhead
- [x] Simple deployment model (Node.js + Express)

**Feature Mapping (Current Status):**
| Feature | Status | Code Location |
|---------|--------|---------------|
| Cost-effective architecture | ✅ Implemented | Node.js + Express (free) |
| Multi-user support | ✅ Implemented | `src/Controllers/UserController.ts` |
| User data isolation | ✅ Implemented | Username-based separation |
| Persistent storage | ✅ Implemented | JSON/MongoDB backend |
| Simple deployment | ✅ Implemented | `src/server.ts` |

---

## Implementation Status

### ✅ Implemented & Tested
- File CRUD operations (create, read, update, delete)
- Palette color management (add, update colors)
- Pixel editing (recolor pixels by coordinates)
- Undo/redo with 50+ action history
- User authentication & workspace isolation
- PNG and JSON export formats
- Persistent file storage (JSON or MongoDB)
- Jest unit tests covering core functionality

### ⚠️ Needs Enhancement
- Frontend UI/UX polish for onboarding
- In-app help/tooltips system
- Export performance optimization
- Comprehensive error messages

### ❌ Out of Scope
- Keyboard shortcuts
- Auto-save functionality
- File versioning
- No-account/anonymous mode
- Cross-device synchronization
- Real-time collaboration

---

## Implementation Priority Matrix

| Story | Priority | Status | Impact |
|-------|----------|--------|--------|
| Luke (Multi-file & core features) | HIGH | ✅ Complete | Core functionality |
| Linda (Export functionality) | HIGH | ✅ Complete | User value |
| Jan (Core editing) | HIGH | ✅ Complete | User value |
| George (Onboarding/UX) | MEDIUM | ⚠️ Partial | User adoption |
| Greg (Business case) | MEDIUM | ✅ Complete | Stakeholder confidence |

---

## Testing Coverage

### Unit Tests (Currently Implemented)
✅ File creation with validation  
✅ Palette color operations  
✅ Pixel editing and recoloring  
✅ Undo/redo functionality  
✅ File deletion and cleanup  
✅ User authentication  
✅ File listing and retrieval  
✅ Edge cases and error handling  

### Test Files
- `Tests/FileTest.test.ts` — Core file operations
- `Tests/FileBasic.test.ts` — Basic functionality
- `Tests/FileEdgeCases.test.ts` — Edge cases
- `Tests/FileUndoRedo.test.ts` — Undo/redo operations
- `Tests/FileDeleteIntegration.test.ts` — Deletion workflows
- `Tests/UserBasic.test.ts` — User management
- `Tests/FileUserArrayConsistency.test.ts` — User file tracking

### Test Execution
```bash
npm test