# .cursorrules Generator

Generate a comprehensive .cursorrules file optimized for AI coding assistants (Cursor, Windsurf, etc.).

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend:** {{BACKEND_SERVICE}}
**CSS:** {{CSS_FRAMEWORK}}
**Architecture:** {{ARCHITECTURE}}
**Project Size:** {{SIZE}}
**Complexity:** {{COMPLEXITY}}/10

## Project Structure

```
{{TREE}}
```

## Requirements

Generate a detailed .cursorrules file with:

### 1. Project Overview
```
# Project: [Name]
# Architecture: {{ARCHITECTURE}}
# Stack: {{FRAMEWORK}} + {{LANGUAGE}} + {{CSS_FRAMEWORK}}
# Size: {{SIZE}} (Complexity: {{COMPLEXITY}}/10)
```

### 2. Tech Stack & Versions
- Framework and recommended version
- Language and TypeScript config
- Styling solution
- Backend/database (if any)
- Key dependencies

### 3. Architecture Rules

For **MVC**:
- Models go in `models/` - data structures only
- Views go in `views/` or `components/` - UI only
- Controllers go in `controllers/` - business logic
- Services go in `services/` - shared logic
- Never mix concerns between layers

For **Clean Architecture**:
- Domain layer is independent
- Application layer uses domain
- Infrastructure depends on application
- Presentation depends on application
- Dependencies point inward only

For **Flat/Simple**:
- Components are pure and reusable
- Hooks contain all logic
- Types are centralized
- Keep files small and focused

For **Feature-Sliced**:
- Each feature is self-contained
- Shared code goes in `shared/`
- Features don't import from each other
- Use public API exports only

For **Layered**:
- Presentation calls business
- Business calls data
- Never skip layers
- Each layer has clear responsibility

### 4. File Organization
- Where to create new files
- Naming conventions (PascalCase, camelCase, kebab-case)
- File structure patterns
- Import order rules

### 5. Component Guidelines (for React/Next.js)
- Functional components only
- Use TypeScript for all components
- Props interface naming: `[ComponentName]Props`
- Export pattern (named vs default)
- Component file structure

### 6. State Management
- How to handle local state
- When to lift state up
- Global state approach (if any)
- Server state vs client state

### 7. Styling Rules
For **Tailwind CSS**:
- Use utility classes
- Create components for repeated patterns
- Use `@apply` sparingly
- Responsive design mobile-first

For **SCSS**:
- Use BEM methodology
- Variables in `_variables.scss`
- Mixins in `_mixins.scss`
- One component per file

### 8. API & Data Fetching
- Where API calls go (services/controllers)
- Error handling pattern
- Loading states
- Type safety for responses

### 9. TypeScript Rules
- Strict mode enabled
- No `any` types
- Interface vs Type preference
- Generics when needed
- Proper return types

### 10. Code Style
- Use ES6+ features
- Async/await over promises
- Destructuring when possible
- Arrow functions preference
- Template literals for strings

### 11. Testing (if applicable)
- Test file location
- Naming convention: `*.test.ts` or `*.spec.ts`
- What to test
- Mock patterns

### 12. Performance
- Code splitting approach
- Lazy loading strategy
- Memoization when needed
- Bundle size awareness

### 13. Security
- Environment variables usage
- API key handling
- Input validation
- XSS prevention

### 14. Git & Commits
- Commit message format
- Branch naming
- What to ignore

### 15. Common Patterns

Provide 3-5 code examples specific to this stack:
```typescript
// Example 1: Component pattern
// Example 2: Hook pattern
// Example 3: API call pattern
```

### 16. Anti-Patterns
- What NOT to do
- Common mistakes to avoid
- Code smells to watch for

### 17. AI Assistant Instructions
- How to help with this codebase
- Preferred code generation style
- What to prioritize
- What to avoid

### 18. Quick Reference
- Common commands
- Useful snippets
- Keyboard shortcuts (if any)

## Output Format

Return ONLY the .cursorrules content, no markdown code blocks.
Start directly with the project overview comment.
Be specific to the {{ARCHITECTURE}} and {{FRAMEWORK}}.
Include actual examples from the project structure.
Make it actionable and clear for AI assistants.
