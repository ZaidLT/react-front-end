# Component Development Guide

## Overview

This guide provides detailed instructions for developing, maintaining, and contributing to components in the Eeva React Web application. It covers best practices, patterns, and conventions established during the React Native to Web migration.

## Component Development Workflow

### 1. Planning a New Component

Before creating a new component, consider:

#### Reusability Assessment
- **Check Existing Components**: Always verify if a similar component already exists
- **Identify Common Patterns**: Look for reusable patterns in existing components
- **Design for Flexibility**: Plan for multiple use cases and configurations

#### Component Scope
```typescript
// Good: Focused, single-purpose component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

// Avoid: Component trying to do too much
interface SuperComponentProps {
  // Handles buttons, forms, modals, navigation, etc.
  // Better to split into focused components
}
```

### 2. Component Creation Process

#### Step 1: Create Component File
```bash
# Create component file in appropriate directory
touch src/components/MyNewComponent.tsx

# Create associated CSS module (if needed)
touch src/components/MyNewComponent.module.css
```

#### Step 2: Component Template
```typescript
// src/components/MyNewComponent.tsx
import React from 'react';
import styles from './MyNewComponent.module.css';

interface MyNewComponentProps {
  // Define props with clear types
  title: string;
  onAction?: () => void;
  variant?: 'default' | 'highlighted';
  children?: React.ReactNode;
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title,
  onAction,
  variant = 'default',
  children
}) => {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <h3 className={styles.title}>{title}</h3>
      {children}
      {onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          Action
        </button>
      )}
    </div>
  );
};

export default MyNewComponent;
```

#### Step 3: CSS Module Styling
```css
/* src/components/MyNewComponent.module.css */
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--color-background);
}

.container.default {
  border: 1px solid var(--color-border);
}

.container.highlighted {
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.actionButton {
  margin-top: auto;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actionButton:hover {
  background-color: var(--color-primary-dark);
}
```

### 3. Component Testing

#### Unit Test Template
```typescript
// src/components/__tests__/MyNewComponent.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyNewComponent } from '../MyNewComponent';

describe('MyNewComponent', () => {
  it('renders with title', () => {
    render(<MyNewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    const mockAction = jest.fn();
    render(<MyNewComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant class', () => {
    render(<MyNewComponent title="Test" variant="highlighted" />);
    const container = screen.getByText('Test').closest('div');
    expect(container).toHaveClass('highlighted');
  });

  it('renders children when provided', () => {
    render(
      <MyNewComponent title="Test">
        <span>Child content</span>
      </MyNewComponent>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
```

## React Native Conversion Patterns

### Common Conversion Scenarios

#### 1. View to div Conversion
```typescript
// React Native
<View style={styles.container}>
  <Text style={styles.text}>Content</Text>
</View>

// React Web
<div className={styles.container}>
  <span className={styles.text}>Content</span>
</div>
```

#### 2. TouchableOpacity to Button
```typescript
// React Native
<TouchableOpacity onPress={handlePress} style={styles.button}>
  <Text>Click me</Text>
</TouchableOpacity>

// React Web
<button onClick={handlePress} className={styles.button}>
  <span>Click me</span>
</button>
```

#### 3. ScrollView to div with overflow
```typescript
// React Native
<ScrollView style={styles.scrollContainer}>
  {content}
</ScrollView>

// React Web
<div className={styles.scrollContainer}>
  {content}
</div>

/* CSS */
.scrollContainer {
  overflow-y: auto;
  max-height: 400px;
}
```

#### 4. Image to img Element
```typescript
// React Native
<Image source={{ uri: imageUrl }} style={styles.image} />

// React Web
<img src={imageUrl} alt="Description" className={styles.image} />
```

### Maintaining Visual Consistency

#### Color Usage
```typescript
// Always use design system colors
import { Colors } from '../styles/colors';

// In CSS modules
.element {
  background-color: var(--color-primary);
  color: var(--color-text-primary);
}

// Or in inline styles (when necessary)
style={{ backgroundColor: Colors.PRIMARY }}
```

#### Typography
```typescript
// Use consistent typography classes
import { Typography } from '../styles/typography';

.text {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
}
```

#### Spacing
```typescript
// Use consistent spacing values
.container {
  padding: var(--spacing-medium);
  margin: var(--spacing-small);
}
```

## Advanced Component Patterns

### 1. Compound Components
```typescript
// Main component
export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className={styles.card}>{children}</div>;
};

// Sub-components
Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.cardHeader}>{children}</div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.cardBody}>{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.cardFooter}>{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### 2. Render Props Pattern
```typescript
interface DataProviderProps<T> {
  children: (data: {
    items: T[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
  fetchData: () => Promise<T[]>;
}

export function DataProvider<T>({ children, fetchData }: DataProviderProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return <>{children({ items, loading, error, refetch })}</>;
}
```

### 3. Custom Hooks for Component Logic
```typescript
// Custom hook for component state management
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
};

// Usage in component
const MyComponent = () => {
  const { value: isOpen, toggle, setFalse } = useToggle();
  
  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <Modal onClose={setFalse}>Content</Modal>}
    </div>
  );
};
```

## Performance Optimization

### 1. React.memo for Pure Components
```typescript
interface ExpensiveComponentProps {
  data: ComplexData;
  onAction: (id: string) => void;
}

export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data, onAction }) => {
    return (
      <div>
        {/* Expensive rendering logic */}
      </div>
    );
  },
  // Custom comparison function (optional)
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. useMemo for Expensive Calculations
```typescript
const MyComponent: React.FC<{ items: Item[] }> = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => {
      // Expensive calculation
      return acc + complexCalculation(item);
    }, 0);
  }, [items]);

  return <div>Result: {expensiveValue}</div>;
};
```

### 3. useCallback for Event Handlers
```typescript
const ListComponent: React.FC<{ items: Item[] }> = ({ items }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleItemClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={handleItemClick}
          isSelected={selectedId === item.id}
        />
      ))}
    </div>
  );
};
```

## Accessibility Guidelines

### 1. Semantic HTML
```typescript
// Use appropriate HTML elements
<button onClick={handleClick}>Action</button>  // Not <div>
<nav>Navigation content</nav>                  // Not <div>
<main>Main content</main>                      // Not <div>
<article>Article content</article>             // Not <div>
```

### 2. ARIA Attributes
```typescript
<button
  aria-label="Close modal"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  ×
</button>

<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
</div>
```

### 3. Keyboard Navigation
```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
  if (event.key === 'Escape') {
    handleClose();
  }
};

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  Interactive element
</div>
```

## Component Documentation

### 1. JSDoc Comments
```typescript
/**
 * A reusable button component with multiple variants and sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="large" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
interface ButtonProps {
  /** The button content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Click handler */
  onClick?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}
```

### 2. Component Demo Integration
```typescript
// Add component to component demo page
// src/components/ComponentDemo.tsx

const componentExamples = [
  {
    name: 'MyNewComponent',
    component: MyNewComponent,
    props: {
      title: 'Example Title',
      variant: 'highlighted',
      onAction: () => alert('Action clicked!')
    },
    description: 'A flexible component for displaying content with actions.'
  }
];
```

## Best Practices Checklist

### Before Submitting a Component
- [ ] **TypeScript**: All props and state properly typed
- [ ] **Testing**: Unit tests cover main functionality
- [ ] **Accessibility**: ARIA attributes and keyboard navigation
- [ ] **Performance**: Optimized with memo/useMemo/useCallback where appropriate
- [ ] **Styling**: Uses CSS modules and design system tokens
- [ ] **Documentation**: JSDoc comments and examples
- [ ] **Consistency**: Follows established patterns and conventions
- [ ] **Responsive**: Works on mobile, tablet, and desktop
- [ ] **Error Handling**: Graceful error states and fallbacks

### Code Review Checklist
- [ ] **Functionality**: Component works as intended
- [ ] **Reusability**: Component is flexible and reusable
- [ ] **Performance**: No unnecessary re-renders or calculations
- [ ] **Accessibility**: Meets web accessibility standards
- [ ] **Testing**: Adequate test coverage
- [ ] **Documentation**: Clear and helpful documentation

---

*For component architecture details, see [Component Architecture](./architecture.md).*
