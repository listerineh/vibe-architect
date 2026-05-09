# Frontend Architecture

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── generator/         # Generator page
├── components/            # React components
│   ├── minimal-form.tsx
│   ├── streaming-preview.tsx
│   ├── project-summary.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   └── useBoilerplateGenerator.ts
├── services/              # API services
│   └── api.service.ts
├── types/                 # TypeScript types
│   ├── api.ts            # API-related types
│   └── ui.ts             # UI-related types
├── lib/                   # Utilities and helpers
│   ├── constants.ts      # App constants
│   ├── utils.ts          # General utilities
│   ├── file-utils.ts     # File operations
│   └── api.ts            # Legacy API (to be deprecated)
└── public/                # Static assets
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**

- **Components**: Pure UI components, minimal logic
- **Hooks**: Reusable business logic
- **Services**: API communication layer
- **Types**: Centralized type definitions
- **Constants**: Configuration and static data

### 2. **Type Safety**

All code is fully typed with TypeScript:
- API contracts defined in `types/api.ts`
- UI state types in `types/ui.ts`
- Strict type checking enabled

### 3. **Single Responsibility**

Each module has a single, well-defined purpose:
- `api.service.ts`: HTTP requests and error handling
- `useBoilerplateGenerator.ts`: Boilerplate generation state management
- `constants.ts`: Application configuration

### 4. **Error Handling**

Centralized error handling with custom `APIError` class:
- Network errors
- Server errors
- Validation errors

## 📦 Key Modules

### Services Layer

**`services/api.service.ts`**
- Singleton service for API communication
- Centralized error handling
- Type-safe requests
- Automatic JSON parsing

```typescript
const apiService = new APIService();
const result = await apiService.previewBoilerplate(request);
```

### Hooks Layer

**`hooks/useBoilerplateGenerator.ts`**
- Manages boilerplate generation state
- Handles preview and download logic
- Provides loading and error states
- Encapsulates streaming sections logic

```typescript
const {
  preview,
  isLoading,
  error,
  handlePreview,
  handleGenerate,
} = useBoilerplateGenerator();
```

### Types Layer

**`types/api.ts`**
- API request/response types
- Matches backend contracts
- Ensures type safety across the app

**`types/ui.ts`**
- UI-specific types
- Form state
- Loading/error states

### Constants Layer

**`lib/constants.ts`**
- API configuration
- Tech stack options
- Validation rules
- Error messages
- UI constants

## 🔄 Data Flow

```
User Input
    ↓
Component (UI)
    ↓
Custom Hook (Business Logic)
    ↓
Service (API Communication)
    ↓
Backend API
    ↓
Service (Response Parsing)
    ↓
Custom Hook (State Update)
    ↓
Component (UI Update)
```

## 🎯 Best Practices

### Components

```typescript
// ✅ Good: Pure, focused component
export function ProjectSummary({ preview }: Props) {
  return <div>{preview.project_metadata.name}</div>;
}

// ❌ Bad: Component with API logic
export function ProjectSummary() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/preview').then(/* ... */);
  }, []);
}
```

### Hooks

```typescript
// ✅ Good: Encapsulated logic
export function useBoilerplateGenerator() {
  const [state, setState] = useState(/* ... */);
  const handlePreview = useCallback(/* ... */);
  return { state, handlePreview };
}

// ❌ Bad: Hook with UI concerns
export function useBoilerplateGenerator() {
  return <div>Loading...</div>; // Hooks don't return JSX
}
```

### Services

```typescript
// ✅ Good: Single responsibility
class APIService {
  async previewBoilerplate(request: ProjectRequest) {
    return this.request('/api/preview', { method: 'POST', body: request });
  }
}

// ❌ Bad: Mixed concerns
class APIService {
  async previewBoilerplate(request: ProjectRequest) {
    const result = await fetch(/* ... */);
    updateUI(result); // Service shouldn't update UI
  }
}
```

## 🚀 Future Improvements

### Planned Enhancements

1. **State Management**
   - Consider Zustand or Jotai for global state
   - Currently using local state (sufficient for now)

2. **Caching**
   - Implement React Query for server state
   - Cache API responses
   - Optimistic updates

3. **Testing**
   - Unit tests for hooks
   - Integration tests for services
   - E2E tests with Playwright

4. **Performance**
   - Code splitting
   - Lazy loading components
   - Memoization where needed

5. **Error Boundaries**
   - React Error Boundaries for graceful error handling
   - Fallback UI components

6. **Logging**
   - Structured logging
   - Error tracking (Sentry)
   - Analytics integration

## 📚 Migration Guide

### From Old API to New Service

**Before:**
```typescript
import { previewBoilerplate } from '@/lib/api';

const result = await previewBoilerplate(request);
```

**After:**
```typescript
import { apiService } from '@/services/api.service';

const result = await apiService.previewBoilerplate(request);
```

### From Inline Logic to Custom Hook

**Before:**
```typescript
function Component() {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePreview = async () => {
    setIsLoading(true);
    const result = await previewBoilerplate(/* ... */);
    setPreview(result);
    setIsLoading(false);
  };
  
  return /* JSX */;
}
```

**After:**
```typescript
function Component() {
  const { preview, isLoading, handlePreview } = useBoilerplateGenerator();
  
  return /* JSX */;
}
```

## 🔧 Development Guidelines

1. **Always use TypeScript** - No `any` types unless absolutely necessary
2. **Keep components pure** - Extract logic to hooks
3. **Use constants** - No magic strings or numbers
4. **Handle errors** - Always catch and display errors gracefully
5. **Write tests** - Test hooks and services
6. **Document complex logic** - Add comments for non-obvious code
7. **Follow naming conventions**:
   - Components: PascalCase
   - Hooks: camelCase with `use` prefix
   - Services: camelCase with `.service.ts` suffix
   - Types: PascalCase with descriptive names

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
