# Development Workflow

## Overview

This guide outlines the development workflow, best practices, and processes for contributing to the Eeva React Web project. Following these guidelines ensures code quality, consistency, and maintainability.

## Git Workflow

### Branch Strategy
```bash
# Main branches
main        # Production-ready code
dev         # Development integration branch

# Feature branches
feature/    # New features
bugfix/     # Bug fixes
hotfix/     # Critical production fixes
docs/       # Documentation updates
```

### Branch Naming Convention
```bash
# Feature branches
feature/task-management-ui
feature/oauth-integration
feature/responsive-calendar

# Bug fix branches
bugfix/login-validation-error
bugfix/calendar-timezone-issue

# Documentation branches
docs/api-documentation
docs/component-guide
```

### Typical Workflow
```bash
# 1. Start from dev branch
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature description"

# 4. Push branch and create PR
git push origin feature/new-feature-name
# Create Pull Request via GitHub UI

# 5. After PR approval and merge
git checkout dev
git pull origin dev
git branch -d feature/new-feature-name
```

## Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add OAuth login with Google
fix(calendar): resolve timezone display issue
docs(api): update authentication documentation
style(components): format Button component
refactor(services): simplify API error handling
test(auth): add unit tests for login flow
chore(deps): update React to v18.2.0
```

## Code Quality Standards

### TypeScript Guidelines
```typescript
// Always use explicit types for function parameters and return values
function processUserData(userData: UserData): ProcessedUser {
  return {
    id: userData.id,
    fullName: `${userData.firstName} ${userData.lastName}`,
    email: userData.email.toLowerCase()
  };
}

// Use interfaces for object shapes
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  disabled?: boolean;
}

// Use enums for constants
enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}
```

### Component Guidelines
```typescript
// Use functional components with TypeScript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Export component as default when it's the main export
export default Button;
```

### CSS Guidelines
```css
/* Use CSS Modules for component-specific styles */
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Follow BEM naming convention */
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}

.button--primary {
  background-color: var(--color-primary);
  color: white;
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Testing Strategy

### Unit Testing
```typescript
// Test individual components and functions
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing
```typescript
// Test component interactions and API integration
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from './LoginPage';

describe('Login Integration', () => {
  it('successfully logs in user', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Fill form and submit
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    // Wait for navigation or success message
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
  });
});
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test Button.test.tsx
```

## Code Review Process

### Before Creating PR
1. **Self Review**: Review your own code for obvious issues
2. **Test Locally**: Ensure all tests pass and app works correctly
3. **Check Linting**: Run `pnpm lint` and fix any issues
4. **Update Documentation**: Update relevant docs if needed

### PR Guidelines
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

### Review Checklist
- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are there adequate tests?
- **Documentation**: Is documentation updated if needed?

## Development Best Practices

### 1. Component Development
```typescript
// Keep components focused and single-purpose
// Use composition over inheritance
// Make components reusable and configurable

// Good: Focused component
const UserAvatar: React.FC<{ user: User; size: 'small' | 'large' }> = ({
  user,
  size
}) => (
  <img 
    src={user.avatar} 
    alt={user.name}
    className={`avatar avatar--${size}`}
  />
);

// Avoid: Component doing too much
const UserProfile = () => {
  // Handles avatar, user info, settings, notifications, etc.
  // Better to split into smaller components
};
```

### 2. State Management
```typescript
// Use local state for component-specific data
const [isOpen, setIsOpen] = useState(false);

// Use context for shared application state
const { user, isAuthenticated } = useAuth();

// Use Zustand for complex state management
const { tasks, addTask, updateTask } = useTaskStore();
```

### 3. API Integration
```typescript
// Always use the service layer
import { getTasks, createTask } from '../services/taskService';

// Handle loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleCreateTask = async (taskData: TaskData) => {
  setLoading(true);
  setError(null);
  
  try {
    const newTask = await createTask(taskData);
    // Handle success
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Performance Optimization
```typescript
// Use React.memo for pure components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

## Debugging Workflow

### 1. Development Debugging
```bash
# Use browser DevTools
# - React DevTools for component inspection
# - Network tab for API requests
# - Console for errors and logs

# Use VS Code debugger
# - Set breakpoints in code
# - Inspect variables and call stack
# - Step through code execution
```

### 2. Common Debug Scenarios
```typescript
// API debugging
console.log('API Request:', { url, data, headers });
console.log('API Response:', response);

// Component debugging
console.log('Component Props:', props);
console.log('Component State:', state);

// Performance debugging
console.time('Expensive Operation');
// ... expensive operation
console.timeEnd('Expensive Operation');
```

### 3. Error Handling
```typescript
// Graceful error handling in components
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Component Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <div>Something went wrong. Please refresh the page.</div>;
  }

  return <>{children}</>;
};
```

## Deployment Workflow

### Development Deployment
```bash
# Automatic deployment on push to dev branch
# Vercel automatically deploys development branch
# URL: https://react-web-eeva-dev.vercel.app
```

### Production Deployment
```bash
# Deployment to production (main branch)
# Requires PR approval and merge to main
# URL: https://react-web-eeva.vercel.app
```

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

## Maintenance Tasks

### Regular Maintenance
```bash
# Update dependencies monthly
pnpm update

# Check for security vulnerabilities
pnpm audit

# Clean up unused dependencies
pnpm prune

# Update documentation as needed
```

### Performance Monitoring
- Monitor bundle size with `pnpm build`
- Check Core Web Vitals in production
- Review React DevTools Profiler
- Monitor API response times

---

*For specific component development guidelines, see [Component Development Guide](../components/development-guide.md).*
