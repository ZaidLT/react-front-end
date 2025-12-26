# Project Architecture

## Overview

The Eeva React Web application follows a modern, scalable architecture built on Next.js with TypeScript. This document outlines the architectural decisions, patterns, and structure that guide the development of the application.

## High-Level Architecture

### Application Layers
```
┌─────────────────────────────────────────┐
│              Presentation Layer          │
│  (React Components, Pages, UI Logic)    │
├─────────────────────────────────────────┤
│              Business Logic Layer       │
│    (Hooks, Context, State Management)   │
├─────────────────────────────────────────┤
│              Service Layer              │
│     (API Services, Data Mapping)       │
├─────────────────────────────────────────┤
│              Infrastructure Layer       │
│  (Next.js, Routing, Build System)      │
└─────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Framework
- **Next.js 15.3.2**: React framework with SSR/SSG capabilities
- **React 18.2.0**: UI library with modern hooks and patterns
- **TypeScript**: Static type checking and enhanced developer experience

#### State Management
- **React Context**: Authentication and global application state
- **Zustand**: Lightweight state management for complex state
- **Local State**: Component-specific state with useState/useReducer

#### Styling & UI
- **CSS Modules**: Component-scoped styling
- **Custom Design System**: Consistent colors, typography, and spacing
- **Responsive Design**: Mobile-first approach with breakpoint-based design

#### Data & API
- **Axios**: HTTP client for API requests
- **JWT Authentication**: Token-based security
- **RESTful API**: Integration with Node.js backend

## Directory Structure

### Project Organization
```
react-web/
├── docs/                    # Project documentation
│   ├── architecture/        # Architecture documentation
│   ├── api/                # API and integration docs
│   ├── components/         # Component development guides
│   ├── development/        # Development setup and workflow
│   ├── deployment/         # Deployment and operations
│   └── migration/          # Migration history and notes
├── public/                 # Static assets
│   ├── assets/            # Copied SVG assets
│   ├── hive-icons/        # Hive-specific icons
│   └── category-icons/    # Category-specific icons
├── scripts/               # Build and utility scripts
├── src/                   # Source code
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and data layer
│   ├── styles/           # Global styles and design tokens
│   ├── util/             # Utility functions and helpers
│   └── assets/           # Source assets (SVGs, images)
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project overview
```

### Source Code Organization

#### App Directory (Next.js Pages)
```
src/app/
├── api/                  # API routes and proxies
├── (auth)/              # Authentication pages
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (main)/              # Main application pages
│   ├── home/
│   ├── calendar/
│   ├── tasks/
│   └── documents/
├── layout.tsx           # Root layout component
├── page.tsx             # Root page component
└── providers.tsx        # Context providers wrapper
```

#### Components Organization
```
src/components/
├── ui/                  # Basic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── forms/               # Form-related components
├── layout/              # Layout components
├── features/            # Feature-specific components
└── modals/              # Modal components
```

## Architectural Patterns

### 1. Component-Based Architecture

#### Atomic Design Principles
- **Atoms**: Basic building blocks (Button, Input, Icon)
- **Molecules**: Simple combinations (SearchInput, UserCard)
- **Organisms**: Complex components (Header, Calendar, TaskList)
- **Templates**: Page layouts and structures
- **Pages**: Complete page implementations

#### Component Composition
```typescript
// Flexible component composition
<Card>
  <Card.Header>
    <Title>Task Details</Title>
    <Actions>
      <Button variant="secondary">Edit</Button>
      <Button variant="danger">Delete</Button>
    </Actions>
  </Card.Header>
  <Card.Body>
    <TaskContent task={task} />
  </Card.Body>
</Card>
```

### 2. Service Layer Pattern

#### API Service Architecture
```typescript
// Service layer abstraction
interface TaskService {
  getTasks(accountId: string): Promise<Task[]>;
  createTask(task: Partial<Task>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

// Implementation with error handling and data mapping
export const taskService: TaskService = {
  async getTasks(accountId: string) {
    try {
      const response = await apiClient.get(`/tasks?accountId=${accountId}`);
      return response.data.map(mapTaskFromAPI);
    } catch (error) {
      throw new ServiceError('Failed to fetch tasks', error);
    }
  }
  // ... other methods
};
```

#### Data Mapping Layer
```typescript
// Frontend/Backend data mapping
export const mapTaskFromAPI = (apiTask: APITask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  isCompleted: apiTask.completed,
  priority: mapPriorityFromAPI(apiTask.priority_level),
  assignedTo: apiTask.assigned_users,
  dueDate: new Date(apiTask.due_date),
  createdAt: new Date(apiTask.created_at),
  updatedAt: new Date(apiTask.updated_at)
});
```

### 3. State Management Architecture

#### Context-Based Global State
```typescript
// Authentication context for global auth state
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### Zustand for Complex State
```typescript
// Task store with Zustand
interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (accountId: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  
  fetchTasks: async (accountId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks(accountId);
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
  // ... other actions
}));
```

### 4. Error Handling Architecture

#### Centralized Error Handling
```typescript
// Error boundary for component-level errors
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logger.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// Standardized API error handling
export class ServiceError extends Error {
  constructor(
    message: string,
    public originalError?: any,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Error handling in services
export const handleAPIError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response;
    throw new ServiceError(
      data.message || 'API request failed',
      error,
      status
    );
  } else if (error.request) {
    throw new ServiceError('Network error', error);
  } else {
    throw new ServiceError('Request setup error', error);
  }
};
```

## Security Architecture

### Authentication & Authorization
```typescript
// JWT token management
export const tokenManager = {
  getToken: (): string | null => {
    return typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
  },
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};
```

### API Security
```typescript
// Secure API client configuration
const createAPIClient = () => {
  const client = axios.create({
    baseURL: '/api',
    timeout: 10000,
  });

  // Request interceptor for authentication
  client.interceptors.request.use((config) => {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh or redirect to login
        await handleTokenRefresh();
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

## Performance Architecture

### Code Splitting Strategy
```typescript
// Route-based code splitting
const LazyTaskPage = React.lazy(() => import('./pages/TaskPage'));
const LazyCalendarPage = React.lazy(() => import('./pages/CalendarPage'));

// Component-based code splitting
const LazyComplexComponent = React.lazy(() => 
  import('./components/ComplexComponent')
);

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyTaskPage />
</Suspense>
```

### Caching Strategy
```typescript
// API response caching
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
}
```

## Testing Architecture

### Testing Strategy
```typescript
// Component testing with React Testing Library
describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    priority: 'medium'
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles task completion toggle', async () => {
    const mockOnToggle = jest.fn();
    render(<TaskCard task={mockTask} onToggleComplete={mockOnToggle} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });
});
```

### Integration Testing
```typescript
// API integration testing
describe('Task Service Integration', () => {
  beforeEach(() => {
    // Setup mock API responses
    mockAxios.reset();
  });

  it('fetches tasks successfully', async () => {
    const mockTasks = [{ id: '1', title: 'Test Task' }];
    mockAxios.onGet('/api/tasks').reply(200, mockTasks);

    const tasks = await taskService.getTasks('account-1');
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Task');
  });
});
```

## Deployment Architecture

### Build Process
```typescript
// Next.js build configuration
const nextConfig = {
  // Optimize for production
  swcMinify: true,
  compress: true,
  
  // Asset optimization
  images: {
    domains: ['node-backend-eeva.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### Environment Configuration
```typescript
// Environment-specific configuration
export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: process.env.NODE_ENV === 'production' ? 5000 : 10000,
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebugTools: process.env.NODE_ENV === 'development',
  },
  security: {
    enableCSP: process.env.NODE_ENV === 'production',
    cookieSecure: process.env.NODE_ENV === 'production',
  },
};
```

## Monitoring & Observability

### Error Tracking
```typescript
// Error tracking and monitoring
export const errorTracker = {
  captureException: (error: Error, context?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.error('Production Error:', error, context);
    } else {
      console.error('Development Error:', error, context);
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error') => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      console[level]('Production Log:', message);
    }
  }
};
```

### Performance Monitoring
```typescript
// Performance monitoring
export const performanceMonitor = {
  measurePageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Send metrics to analytics
      console.log('Page Load Time:', loadTime);
    }
  },
  
  measureComponentRender: (componentName: string, renderTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time:`, renderTime);
    }
  }
};
```

---

*For specific implementation details, see the related documentation sections for [Components](../components/architecture.md), [API Integration](../api/integration.md), and [Development Workflow](../development/workflow.md).*
