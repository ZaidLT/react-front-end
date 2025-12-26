# Component Architecture

## Overview

The Eeva React Web application follows a component-based architecture that emphasizes reusability, consistency, and maintainability. All components have been converted from React Native to React Web while maintaining visual and functional consistency.

## Component Organization

### Directory Structure
```
src/components/
├── UI Components/          # Basic UI building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── Form Components/        # Form-related components
│   ├── DateTimePickerModal.tsx
│   ├── GoogleAddressInput.tsx
│   └── PrioritySelectionView.tsx
├── Layout Components/      # Layout and navigation
│   ├── TabBar.tsx
│   ├── PageHeader.tsx
│   └── MenuBackground.tsx
├── Feature Components/     # Feature-specific components
│   ├── Task.tsx
│   ├── Document.tsx
│   ├── EventCard.tsx
│   └── HiveTile.tsx
├── Modal Components/       # Modal dialogs
│   ├── DeleteModal.tsx
│   ├── UserSelectionModal.tsx
│   └── HiveSelectionModal.tsx
└── Specialized/           # Complex feature components
    ├── Calendar.tsx
    ├── FloatingPlusMenu.tsx
    └── SearchResults.tsx
```

### Component Categories

#### 1. Atomic Components
Basic building blocks that cannot be broken down further:
- `Button` - Standardized button component
- `Input` - Text input with validation
- `Checkbox` - Checkbox with custom styling
- `LoadingSpinner` - Loading indicator

#### 2. Molecular Components
Combinations of atomic components:
- `SearchInput` - Input with search icon
- `FilterChip` - Clickable filter tag
- `UserBasicInfo` - User avatar with name
- `PrioritySelectionView` - Priority picker

#### 3. Organism Components
Complex components combining molecules and atoms:
- `TabBar` - Bottom navigation
- `FloatingPlusMenu` - Expandable action menu
- `Calendar` - Full calendar component
- `SearchResults` - Search results display

#### 4. Template Components
Page-level layout components:
- `PageHeader` - Standardized page header
- `OnboardingWrapper` - Onboarding page layout
- `MenuBackground` - Background with navigation

## Design Patterns

### 1. Composition Pattern
Components are designed to be composable and flexible:

```typescript
// Flexible component composition
<Modal>
  <Modal.Header title="Delete Task" />
  <Modal.Body>
    <p>Are you sure you want to delete this task?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Delete</Button>
  </Modal.Footer>
</Modal>
```

### 2. Render Props Pattern
For components that need to share logic:

```typescript
<DataProvider>
  {({ data, loading, error }) => (
    loading ? <LoadingSpinner /> : 
    error ? <ErrorMessage error={error} /> :
    <DataDisplay data={data} />
  )}
</DataProvider>
```

### 3. Compound Components
Related components grouped together:

```typescript
// TabView compound component
<TabView>
  <TabView.Tab title="Tasks" icon="task">
    <TaskList />
  </TabView.Tab>
  <TabView.Tab title="Events" icon="calendar">
    <EventList />
  </TabView.Tab>
</TabView>
```

## React Native to Web Conversion

### Conversion Principles

#### 1. Visual Consistency
- Maintain exact visual appearance from React Native version
- Preserve color schemes, typography, and spacing
- Keep icon usage and placement identical

#### 2. Functional Parity
- All React Native functionality replicated in web version
- Interaction patterns adapted for web (hover states, click vs touch)
- Keyboard navigation support added

#### 3. Responsive Design
- Components work across desktop, tablet, and mobile
- Breakpoint-based responsive behavior
- Touch-friendly sizing maintained

### Common Conversion Patterns

#### View → div
```typescript
// React Native
<View style={styles.container}>
  <Text>Content</Text>
</View>

// React Web
<div className="container">
  <span>Content</span>
</div>
```

#### TouchableOpacity → button/div with onClick
```typescript
// React Native
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>

// React Web
<button onClick={handlePress} className="touchable">
  <span>Click me</span>
</button>
```

#### StyleSheet → CSS Modules
```typescript
// React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

// React Web
.container {
  display: flex;
  flex: 1;
  background-color: #fff;
}
```

### Library Replacements

| React Native | React Web | Notes |
|--------------|-----------|-------|
| `react-native-svg` | Direct SVG | SVG files imported as components |
| `expo-image` | `<img>` | Standard HTML image element |
| `react-native-calendars` | `react-calendar` | Calendar component library |
| `lottie-react-native` | `lottie-react` | Animation library |
| `expo-router` | `Next.js App Router` | Navigation and routing |

## Component Styling

### CSS Architecture
- **CSS Modules**: Component-scoped styling
- **Global Styles**: Shared design tokens and utilities
- **Responsive Design**: Mobile-first approach

### Design System
```typescript
// Color palette (src/styles/colors.ts)
export const Colors = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  DANGER: '#FF3B30',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GREY: '#8E8E93',
  LIGHT_GREY: '#F2F2F7'
};

// Typography (src/styles/typography.ts)
export const Typography = {
  FONT_SIZE_12: '12px',
  FONT_SIZE_14: '14px',
  FONT_SIZE_16: '16px',
  FONT_SIZE_18: '18px',
  FONT_SIZE_20: '20px',
  FONT_WEIGHT_NORMAL: '400',
  FONT_WEIGHT_MEDIUM: '500',
  FONT_WEIGHT_BOLD: '700'
};
```

### Styling Patterns
```typescript
// Component with CSS Modules
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## State Management in Components

### Local State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Context Usage
```typescript
const { user, isAuthenticated } = useAuth();
const { t } = useTranslation();
const { theme } = useTheme();
```

### Zustand Store Integration
```typescript
import { useUserStore } from '../context/store';

const { user, updateUser } = useUserStore();
```

## Component Props and TypeScript

### Props Interface Pattern
```typescript
interface ComponentProps {
  // Required props
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  
  // Children and styling
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onSubmit,
  variant = 'primary',
  disabled = false,
  children,
  className,
  style
}) => {
  // Component implementation
};
```

### Generic Components
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found'
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }
  
  return (
    <div className="list">
      {items.map((item, index) => (
        <div key={keyExtractor(item)} className="list-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimization

### React.memo for Pure Components
```typescript
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});
```

### useMemo for Expensive Calculations
```typescript
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### useCallback for Event Handlers
```typescript
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Lazy Loading
```typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## Testing Components

### Component Testing Pattern
```typescript
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
  
  it('applies correct variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('danger');
  });
});
```

## Best Practices

### 1. Component Design
- Keep components focused and single-purpose
- Use composition over inheritance
- Make components reusable and configurable
- Follow consistent naming conventions

### 2. Props Design
- Use TypeScript interfaces for all props
- Provide sensible defaults for optional props
- Keep prop APIs simple and intuitive
- Document complex props with JSDoc comments

### 3. Styling
- Use CSS Modules for component-specific styles
- Follow BEM naming convention for CSS classes
- Keep styles close to components
- Use design system tokens consistently

### 4. Performance
- Use React.memo for pure components
- Optimize re-renders with useMemo and useCallback
- Implement lazy loading for large components
- Monitor bundle size and component complexity

---

*For specific component development guidelines, see [Component Development Guide](./development-guide.md).*
