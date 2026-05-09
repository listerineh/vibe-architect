---
name: react
description: React best practices, hooks patterns, performance optimization, and modern React development. Use when working with React components, state management, or React-specific features.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# React Development Guide

Modern React development patterns, best practices, and performance optimization techniques.

## Core Principles

1. **Component Composition** - Build small, reusable components
2. **Declarative UI** - Describe what the UI should look like
3. **Unidirectional Data Flow** - Props down, events up
4. **Immutability** - Never mutate state directly

---

## Hooks Best Practices

### useState

```tsx
// ❌ Multiple related states
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');

// ✅ Group related state
const [user, setUser] = useState({
  firstName: '',
  lastName: '',
  email: ''
});

// ✅ Update immutably
setUser(prev => ({ ...prev, email: 'new@email.com' }));
```

### useEffect

```tsx
// ❌ Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId should be in deps

// ✅ Correct dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ Cleanup function
useEffect(() => {
  const subscription = api.subscribe();
  return () => subscription.unsubscribe();
}, []);

// ✅ Avoid unnecessary effects
// ❌ Don't do this
useEffect(() => {
  setFilteredData(data.filter(item => item.active));
}, [data]);

// ✅ Do this instead
const filteredData = useMemo(
  () => data.filter(item => item.active),
  [data]
);
```

### useCallback & useMemo

```tsx
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Don't overuse - adds overhead
const simple = useMemo(() => a + b, [a, b]); // Unnecessary
```

### Custom Hooks

```tsx
// ✅ Extract reusable logic
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ✅ Use in components
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input value={search} onChange={e => setSearch(e.target.value)} />;
}
```

---

## Component Patterns

### Composition

```tsx
// ✅ Flexible composition with children
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <p>Content</p>
</Card>
```

### Render Props

```tsx
// ✅ Share logic via render props
function DataFetcher<T>({ 
  url, 
  children 
}: { 
  url: string; 
  children: (data: T | null, loading: boolean) => React.ReactNode;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return <>{children(data, loading)}</>;
}

// Usage
<DataFetcher url="/api/users">
  {(users, loading) => loading ? <Spinner /> : <UserList users={users} />}
</DataFetcher>
```

### Compound Components

```tsx
// ✅ Related components that work together
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
} | null>(null);

function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  return context.activeTab === id ? <div>{children}</div> : null;
}

// Usage
<Tabs>
  <TabList>
    <Tab id="tab1">Tab 1</Tab>
    <Tab id="tab2">Tab 2</Tab>
  </TabList>
  <TabPanel id="tab1">Content 1</TabPanel>
  <TabPanel id="tab2">Content 2</TabPanel>
</Tabs>
```

---

## Performance Optimization

### React.memo

```tsx
// ✅ Prevent unnecessary re-renders
const ExpensiveComponent = React.memo(({ data }: { data: Data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// ✅ Custom comparison
const MemoizedComponent = React.memo(
  ({ user }: { user: User }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

### Code Splitting

```tsx
// ✅ Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// ✅ Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

### Virtual Lists

```tsx
// ✅ Use virtualization for long lists
import { FixedSizeList } from 'react-window';

function VirtualList({ items }: { items: Item[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

---

## State Management

### Context API

```tsx
// ✅ Split contexts by concern
const AuthContext = createContext<AuthState | null>(null);
const ThemeContext = createContext<ThemeState | null>(null);

// ✅ Custom hook for context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// ✅ Provider with reducer
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### useReducer

```tsx
// ✅ Complex state logic
type State = { count: number; step: number };
type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

---

## TypeScript Integration

```tsx
// ✅ Proper typing
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

function UserCard({ user, onEdit, className }: UserCardProps) {
  return (
    <div className={className}>
      <h3>{user.name}</h3>
      {onEdit && <button onClick={() => onEdit(user)}>Edit</button>}
    </div>
  );
}

// ✅ Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}
```

---

## Error Handling

```tsx
// ✅ Error boundaries
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// ✅ Async error handling
function DataComponent() {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchData()
      .catch(err => setError(err));
  }, []);
  
  if (error) return <ErrorMessage error={error} />;
  return <div>Data</div>;
}
```

---

## Testing

```tsx
// ✅ Test component behavior
import { render, screen, fireEvent } from '@testing-library/react';

test('button increments counter', () => {
  render(<Counter />);
  
  const button = screen.getByRole('button', { name: /increment/i });
  const count = screen.getByText(/count: 0/i);
  
  fireEvent.click(button);
  
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});

// ✅ Test custom hooks
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

---

## Common Pitfalls

### ❌ Avoid

```tsx
// Direct state mutation
state.items.push(newItem);

// Inline object/array creation in JSX
<Component data={{ id: 1 }} /> // Creates new object every render

// Unnecessary effects
useEffect(() => {
  setDerivedState(computeValue(prop));
}, [prop]);

// Missing keys in lists
{items.map(item => <div>{item.name}</div>)}

// Prop drilling
<A><B><C><D prop={value} /></C></B></A>
```

### ✅ Do Instead

```tsx
// Immutable updates
setState(prev => [...prev, newItem]);

// Memoize objects
const data = useMemo(() => ({ id: 1 }), []);

// Derive state during render
const derivedState = computeValue(prop);

// Always use keys
{items.map(item => <div key={item.id}>{item.name}</div>)}

// Use context or composition
<DataProvider value={value}>
  <A><B><C><D /></C></B></A>
</DataProvider>
```

---

## Resources

- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/react)
- [React Patterns](https://reactpatterns.com/)
