# API Integration

## Overview

The Eeva React Web application integrates with a Node.js backend API hosted on Vercel. The integration uses a proxy pattern through Next.js API routes to handle CORS issues and provide a consistent API interface.

## API Architecture

### Backend API
- **Base URL**: `https://node-backend-eeva.vercel.app/api`
- **Authentication**: JWT Bearer tokens
- **Format**: RESTful JSON API
- **Protection**: Vercel protection bypass header required

### Frontend Proxy
- **Proxy URL**: `/api/*` (Next.js API routes)
- **Purpose**: Handle CORS, add required headers, proxy requests
- **Location**: `src/app/api/[...path]/route.ts`

## API Configuration

### Service Configuration
```typescript
// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
```

### Proxy Configuration
The Next.js API proxy automatically adds required headers:
```typescript
// In API route
headers: {
  'x-vercel-protection-bypass': '0a2eba8c751892e035f6b96605600fae',
  'Content-Type': 'application/json',
  ...requestHeaders
}
```

## API Services

### Service Layer Structure
```
src/services/
├── authService.ts          # Authentication operations
├── services.ts             # Core CRUD operations
├── userService.ts          # User management
├── taskService.ts          # Task operations
├── documentService.ts      # Document management
├── familyService.ts        # Family/hive operations
├── accountService.ts       # Account operations
└── types.ts               # TypeScript interfaces
```

### Core Service Patterns

#### Generic CRUD Operations
```typescript
// GET operations
export const getItems = async (accountId: string): Promise<Item[]> => {
  const response = await axios.get(`${API_BASE_URL}/items?accountId=${accountId}`, {
    headers: getHeaders()
  });
  return response.data;
};

// POST operations
export const createItem = async (item: Partial<Item>): Promise<Item> => {
  const response = await axios.post(`${API_BASE_URL}/items`, item, {
    headers: getHeaders()
  });
  return response.data;
};

// PUT operations
export const updateItem = async (id: string, item: Partial<Item>): Promise<Item> => {
  const response = await axios.put(`${API_BASE_URL}/items/${id}`, item, {
    headers: getHeaders()
  });
  return response.data;
};

// DELETE operations
export const deleteItem = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/items/${id}`, {
    headers: getHeaders()
  });
};
```

#### AI-Powered Services

##### Label Scanning Service
```typescript
// Label scanning with OpenAI
export const scanProductLabel = async (imageFile: File): Promise<LabelScanResponse> => {
  const imageData = await fileToBase64(imageFile);

  const response = await fetch('/api/openai/label-scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Response interface
interface LabelScanResponse {
  success: boolean;
  data?: {
    brand: string | null;
    productName: string | null;
    modelNumber: string | null;
    serialNumber: string | null;
  };
  error?: string;
  tokensUsed?: number;
}
```

## Data Models & Mapping

### Frontend to Backend Mapping
The application maps between frontend models and backend API formats:

#### Task Mapping Example
```typescript
// Frontend model (ITask)
interface ITask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  dueDate: Date;
}

// Backend API format
interface APITask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority_level: number; // 1-4
  assigned_users: string[];
  due_date: string; // ISO string
}

// Mapping functions
const mapTaskToAPI = (task: ITask): APITask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.isCompleted,
  priority_level: priorityToNumber(task.priority),
  assigned_users: task.assignedTo,
  due_date: task.dueDate.toISOString()
});

const mapTaskFromAPI = (apiTask: APITask): ITask => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  isCompleted: apiTask.completed,
  priority: numberToPriority(apiTask.priority_level),
  assignedTo: apiTask.assigned_users,
  dueDate: new Date(apiTask.due_date)
});
```

## API Endpoints

### Authentication Endpoints
```typescript
// User registration and login
POST /api/auth/register
POST /api/auth/login
POST /api/auth/request-password-reset-code
POST /api/auth/reset-password-with-code

// OAuth authentication
POST /api/auth/oauth/{provider}
POST /api/auth/oauth/callback

// Token management
POST /api/auth/refresh-token
POST /api/auth/revoke-token
POST /api/auth/revoke-all-tokens
```

### User Management
```typescript
// User operations
GET /api/users/exists/{email}
GET /api/users/all-data/{accountId}/{userId}
PUT /api/users
GET /api/users/{accountId}
```

### Task Management
```typescript
// Task CRUD operations
GET /api/tasks?accountId={accountId}
POST /api/tasks
PUT /api/tasks/{taskId}
DELETE /api/tasks/{taskId}

// Task-specific operations
PUT /api/tasks/{taskId}/complete
PUT /api/tasks/{taskId}/assign
```

### Event Management
```typescript
// Event operations
GET /api/events?accountId={accountId}
POST /api/events
PUT /api/events/{eventId}
DELETE /api/events/{eventId}

// Calendar-specific
GET /api/events/calendar/{calendarId}
GET /api/events/date-range?start={start}&end={end}
```

### Document Management
```typescript
// Document operations
GET /api/documents?accountId={accountId}
POST /api/documents
PUT /api/documents/{documentId}
DELETE /api/documents/{documentId}

// File upload
POST /api/documents/upload
```

### Note Management
```typescript
// Note operations
GET /api/notes?accountId={accountId}
POST /api/notes
PUT /api/notes/{noteId}
DELETE /api/notes/{noteId}
```

## Error Handling

### API Error Response Format
```typescript
interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
```

### Error Handling Patterns
```typescript
try {
  const response = await axios.get('/api/endpoint');
  return response.data;
} catch (error: any) {
  if (error.response) {
    // API returned an error response
    const apiError = error.response.data;
    console.error('API Error:', apiError.message);
    throw new Error(apiError.message || 'API request failed');
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
    throw new Error('Network connection failed');
  } else {
    // Other error
    console.error('Error:', error.message);
    throw error;
  }
}
```

### Common Error Scenarios
- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **422 Validation Error**: Invalid request data
- **500 Server Error**: Backend server error

## File Upload Handling

### File Upload Pattern
```typescript
export const uploadDocument = async (file: File, metadata: any): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
    headers: {
      ...getHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
```

### File Type Support
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, PNG, GIF, WEBP
- Spreadsheets: XLS, XLSX, CSV

## Caching Strategy

### Local Storage Caching
```typescript
// Cache user data
const cacheUserData = (userData: User) => {
  localStorage.setItem('cached_user_data', JSON.stringify(userData));
  localStorage.setItem('cache_timestamp', Date.now().toString());
};

// Check cache validity
const isCacheValid = (maxAge: number = 5 * 60 * 1000): boolean => {
  const timestamp = localStorage.getItem('cache_timestamp');
  if (!timestamp) return false;
  
  return Date.now() - parseInt(timestamp) < maxAge;
};
```

### API Response Caching
- User data: 5 minutes
- Task lists: 2 minutes
- Document lists: 10 minutes
- Static data: 1 hour

## Development Guidelines

### Making API Calls
```typescript
// Always use the service layer
import { getTasks, createTask } from '../services/taskService';

// Don't make direct axios calls in components
const tasks = await getTasks(accountId);
const newTask = await createTask(taskData);
```

### Error Handling in Components
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAPICall = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await apiCall();
    // Handle success
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### TypeScript Integration
```typescript
// Always type API responses
interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Use generic types for reusable functions
const fetchData = async <T>(endpoint: string): Promise<T> => {
  const response = await axios.get<APIResponse<T>>(endpoint);
  return response.data.data;
};
```

## Testing API Integration

### Unit Tests
- Test service functions with mocked axios
- Test data mapping functions
- Test error handling scenarios

### Integration Tests
- Test complete API flows
- Test authentication integration
- Test file upload functionality

### API Testing Tools
- Use Postman/Insomnia for manual API testing
- Backend API documentation available at `/api/docs`

---

*For authentication-specific API details, see [Authentication System](./authentication.md).*
