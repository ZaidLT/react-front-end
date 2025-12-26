# Eeva React Web - Application Analysis

## Overview
This is a comprehensive analysis of the **Eeva React Web** application, a family organization platform built with Next.js 15 and React 18. The app was migrated from React Native to React Web and provides tools for task management, calendar integration, document storage, and family coordination.

---

## 📊 Application Statistics

### Pages Count
**Total Pages: 66**

The application uses Next.js App Router with file-based routing. Each `page.tsx` file represents a unique route.

### Backend API Endpoints
**Total API Route Categories: 29**

The backend is accessed through Next.js API routes that proxy requests to the main Eeva API.

---

## 🗺️ Page Structure & Routes

### Authentication & Onboarding (5 pages)
- `/login` - User login page
- `/register` - New user registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset with token
- `/validate-code` - Code validation
- `/oauth-callback` - OAuth authentication callback
- `/hive-selection` - Select/create family hive after registration

### Home & Dashboard (3 pages)
- `/` (root) - Landing/welcome page
- `/home` - Main dashboard after login
- `/eeva` - Eeva AI assistant interface

### Life Management (6 pages)
- `/life` - Main life overview page
- `/life/activities` - Activity timeline view
- `/life/all-dents` - All "dents" (events/tasks/notes combined)
- `/life/completed-tasks` - Completed tasks view
- `/life/incomplete-tasks` - Incomplete tasks view
- `/life/member/[index]` - Individual member's life view

### Task Management (5 pages)
- `/create-task` - Create new task
- `/edit-task/[id]` - Edit existing task
- `/view-task/[taskId]` - View task details

### Event Management (5 pages)
- `/create-event` - Create new event
- `/edit-event/[eventId]` - Edit existing event
- `/view-event/[eventId]` - View event details
- `/calendars` - Calendar overview
- `/time` - Time management view

### Note/Document Management (7 pages)
- `/create-note` - Create new note
- `/create-doc` - Create new document
- `/edit-note/[noteId]` - Edit existing note
- `/edit-document` - Edit document
- `/view-note/[noteId]` - View note details
- `/document-viewer` - Document viewer with PDF support

### People & Contacts (4 pages)
- `/people` - People/contacts list
- `/people/[id]` - View person details
- `/people/[id]/edit` - Edit person details
- `/people/new` - Add new person

### Family/Hive Management (5 pages)
- `/my-hive` - Family hive overview
- `/my-hive/edit/[id]` - Edit hive member
- `/my-hive/member/[id]` - View hive member details
- `/my-hive/member/[id]/edit` - Edit hive member details
- `/house-hive` - House and hive combined view

### Property Management (11 pages)
- `/house` - House overview
- `/property-info` - Property information
- `/property-detail/[tileId]` - Property tile details
- `/edit-property-detail/[tileId]` - Edit property tile
- `/spaces` - Home spaces list
- `/space-detail/[id]` - Space details
- `/space-edit/[id]` - Edit space
- `/appliances` - Appliances list
- `/appliance-detail/[id]` - Appliance details
- `/edit-appliance-detail/[id]` - Edit appliance
- `/utilities` - Utilities overview
- `/utility-detail/[type]` - Utility details by type
- `/utility-edit/[type]` - Edit utility

### User Profile & Settings (3 pages)
- `/profile` - User profile view
- `/profile/edit` - Edit user profile
- `/settings` - Application settings

### Other Features (7 pages)
- `/search` - Global search
- `/beeva-chat` - Beeva AI chat interface
- `/support` - Support page
- `/privacy-policy` - Privacy policy

### Demo & Testing Pages (5 pages)
- `/component-demo` - Component showcase
- `/icon-demo` - Icon library demo
- `/calendar-components-demo` - Calendar components demo
- `/calendar-test` - Calendar testing
- `/test-auth` - Authentication testing
- `/test-api-config` - API configuration testing
- `/test-label-scan` - Label scanning testing

---

## 🔌 Backend API Integration

### API Architecture

The application uses a **proxy-based architecture** where:
1. Frontend makes requests to `/api/*` (Next.js API routes)
2. Next.js API routes proxy requests to the main backend
3. Backend URLs:
   - **Production**: `https://api.eeva.app/api`
   - **Development**: `https://dev.api.eeva.app/api`

### API Service Categories (29 endpoints)

#### 1. **Authentication & Authorization**
- `/api/auth` - Login, logout, token refresh
- `/api/firebase` - Firebase authentication integration

#### 2. **User Management**
- `/api/users` - User CRUD operations
- `/api/accounts` - Account management
- `/api/providers` - OAuth provider management

#### 3. **Task Management**
- `/api/tasks` - Task CRUD operations
  - GET `/tasks/user/{userId}` - Get user's tasks
  - GET `/tasks/account/{accountId}` - Get account's tasks
  - POST `/tasks` - Create task
  - PUT `/tasks/{id}` - Update task
  - DELETE `/tasks/{id}` - Delete task

#### 4. **Event Management**
- `/api/events` - Event CRUD operations
  - GET `/events/user/{userId}` - Get user's events
  - GET `/events/account/{accountId}` - Get account's events
  - POST `/events` - Create event
  - PUT `/events/{id}` - Update event
  - DELETE `/events/{id}` - Delete event
- `/api/event-times` - Event time management

#### 5. **Note Management**
- `/api/notes` - Note CRUD operations
  - GET `/notes/user/{userId}` - Get user's notes
  - GET `/notes/account/{accountId}` - Get account's notes
  - POST `/notes` - Create note
  - PUT `/notes/{id}` - Update note
  - DELETE `/notes/{id}` - Delete note

#### 6. **Document Management**
- `/api/files` - File upload/download
- `/api/file-proxy` - File proxy for secure access
- `/api/file-users` - File user associations
- `/api/file-events` - File event associations

#### 7. **Calendar Integration**
- `/api/calendars` - Calendar sync and management

#### 8. **Contact Management**
- `/api/contacts` - Contact CRUD operations

#### 9. **Property/Tile Management**
- `/api/tiles` - Property tiles (appliances, spaces, utilities)

#### 10. **Activity Tracking**
- `/api/activities` - Activity timeline
- `/api/dents` - Combined events/tasks/notes ("dents")

#### 11. **Statistics & Analytics**
- `/api/stats` - Weekly stats and analytics

#### 12. **Search**
- `/api/search` - Global search across all entities

#### 13. **AI Features**
- `/api/beeva` - Beeva AI chat
- `/api/openai` - OpenAI integration for label scanning

#### 14. **Testing & Configuration**
- `/api/test-api` - API testing
- `/api/test-dents` - Dents testing
- `/api/test-all-environments` - Environment testing
- `/api/test-environment-config` - Environment config testing
- `/api/test-local-config` - Local config testing
- `/api/test-prod-config` - Production config testing
- `/api/proxy` - General proxy endpoint

---

## 🔗 Page-to-Backend Connections

### How Pages Connect to Backend

#### Service Layer Architecture
The application uses a **service layer pattern** with dedicated service files:

**Core Services** (located in `/src/services/`):
- `authService.ts` - Authentication operations
- `userService.ts` - User management
- `taskService.ts` - Task operations
- `calendarService.ts` - Calendar operations
- `documentService.ts` - Document/file operations
- `familyService.ts` - Family/hive operations
- `tileService.ts` - Property tile operations
- `dentsService.ts` - Dents (combined items) operations
- `accountService.ts` - Account operations
- `providerService.ts` - OAuth provider operations
- `beevaChat.ts` - AI chat operations
- `services.ts` - Main service aggregator (1,706 lines)

#### HTTP Client
- **Axios** is used for all HTTP requests
- Authentication via JWT tokens stored in `localStorage`
- Headers include: `Authorization: Bearer {token}`

#### Example Connection Flow

**Task Creation Flow:**
```
User fills form on /create-task page
  ↓
Page calls taskService.createTask(taskData)
  ↓
taskService makes POST to /api/tasks
  ↓
Next.js API route proxies to https://api.eeva.app/api/tasks
  ↓
Backend processes request
  ↓
Response flows back through proxy
  ↓
Page updates UI with new task
```

#### Data Mapping
The services handle field name mapping between:
- **Frontend format**: React Native-style naming (e.g., `User_uniqueId`, `Title`)
- **Backend format**: Camelcase naming (e.g., `userId`, `title`)

Example from `services.ts`:
```typescript
const mapTaskResponse = (tasks: any[]): ITTask[] => {
  return tasks.map((apiTask: any) => ({
    UniqueId: apiTask.id,
    User_uniqueId: apiTask.userId,
    Title: apiTask.title,
    // ... more mappings
  }));
};
```

---

## 📋 Key Features by Page Category

### Task Management Pages
**Backend APIs Used:**
- `GET /api/tasks/user/{userId}` - Fetch user tasks
- `GET /api/tasks/account/{accountId}` - Fetch account tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Query Parameters:**
- `includeCompleted` - Include completed tasks
- `includeOnlyThisWeeksItems` - Filter to current week

### Event Management Pages
**Backend APIs Used:**
- `GET /api/events/user/{userId}` - Fetch user events
- `GET /api/events/account/{accountId}` - Fetch account events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

**Query Parameters:**
- `start` - Start date filter
- `end` - End date filter
- `pageSize` - Pagination size
- `pageIndex` - Pagination index
- `includeOnlyThisWeeksItems` - Filter to current week

### Document Management Pages
**Backend APIs Used:**
- `GET /api/files` - Fetch files
- `POST /api/files` - Upload file
- `GET /api/file-proxy` - Secure file access
- `DELETE /api/files/{id}` - Delete file

**Special Features:**
- PDF viewer with CORS handling
- File upload with progress tracking
- Document categorization

### Life/Dents Pages
**Backend APIs Used:**
- `GET /api/dents` - Fetch combined items (tasks, events, notes)
- `GET /api/activities` - Fetch activity timeline

**Aggregation:**
These pages combine data from multiple sources (tasks, events, notes) into a unified timeline view.

---

## 🔐 Authentication Flow

### OAuth Providers
- Google OAuth
- Apple OAuth

### Authentication Pages
1. `/login` - Email/password or OAuth
2. `/oauth-callback` - OAuth redirect handler
3. `/register` - New user registration
4. `/forgot-password` - Password recovery
5. `/reset-password` - Password reset with token

### Backend Integration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/apple` - Apple OAuth

### Token Management
- JWT tokens stored in `localStorage` as `auth_token`
- Tokens included in all API requests via `Authorization` header
- Automatic token refresh on 401 responses

---

## 🎨 Technology Stack

### Frontend
- **Next.js 15.3.2** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management
- **Axios** - HTTP client
- **CSS Modules** - Component styling

### Backend Integration
- **Next.js API Routes** - Proxy layer
- **REST API** - Main backend communication
- **JWT** - Authentication tokens

### Special Features
- **OpenAI Integration** - AI label scanning for appliances
- **Lottie Animations** - Rich UI animations
- **React Calendar** - Calendar components
- **PDF.js** - Document viewing

---

## 📁 Project Structure

```
react-web/
├── src/
│   ├── app/                    # Next.js App Router pages (66 pages)
│   │   ├── api/               # API proxy routes (29 categories)
│   │   ├── (auth)/            # Auth-related pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── ...                # Feature pages
│   ├── components/            # React components
│   ├── services/              # API service layer (16 files)
│   ├── stores/                # Zustand state stores
│   ├── config/                # Configuration files
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── docs/                      # Documentation (24 files)
```

---

## 🚀 Deployment

- **Platform**: Vercel
- **Production URL**: https://react-web-eeva.vercel.app
- **Environment Detection**: Automatic via `VERCEL_ENV`
- **API Routing**: Environment-based (prod vs dev API)

---

## 📊 Summary

### Pages by Category
| Category | Count |
|----------|-------|
| Authentication | 7 |
| Home & Dashboard | 3 |
| Life Management | 6 |
| Task Management | 5 |
| Event Management | 5 |
| Note/Document Management | 7 |
| People & Contacts | 4 |
| Family/Hive Management | 5 |
| Property Management | 11 |
| User Profile & Settings | 3 |
| Other Features | 5 |
| Demo & Testing | 5 |
| **TOTAL** | **66** |

### API Endpoints by Category
| Category | Count |
|----------|-------|
| Core Data (Tasks, Events, Notes) | 3 |
| User & Auth | 4 |
| Files & Documents | 4 |
| Calendar & Contacts | 2 |
| Property Management | 1 |
| Activity & Analytics | 3 |
| AI Features | 2 |
| Testing & Config | 7 |
| Other | 3 |
| **TOTAL** | **29** |

---

## 🔍 Key Insights

1. **Comprehensive Application**: 66 pages covering all aspects of family organization
2. **Well-Structured Backend**: 29 API endpoint categories with clear separation of concerns
3. **Service Layer Pattern**: Clean abstraction between UI and API calls
4. **Proxy Architecture**: Next.js API routes provide security and flexibility
5. **Data Mapping**: Handles legacy React Native field names while using modern backend format
6. **Environment-Aware**: Automatic switching between dev and prod APIs
7. **Feature-Rich**: Includes AI features, document management, and comprehensive family coordination tools

---

*Generated: 2025-12-04*
