# ARCHITECTURE.md Generator

Generate a detailed ARCHITECTURE.md document explaining the project's architecture decisions.

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend:** {{BACKEND_SERVICE}}
**CSS:** {{CSS_FRAMEWORK}}
**Selected Architecture:** {{ARCHITECTURE}}
**Project Size:** {{SIZE}}
**Complexity:** {{COMPLEXITY}}/10
**Reasoning:** {{REASONING}}

## Project Structure

```
{{TREE}}
```

## Requirements

Generate a comprehensive ARCHITECTURE.md with:

### 1. Header
```markdown
# Architecture Documentation

**Project:** [Project Name]
**Architecture Pattern:** {{ARCHITECTURE}}
**Complexity:** {{SIZE}} ({{COMPLEXITY}}/10)
**Last Updated:** [Current Date]
```

### 2. Architecture Overview
- Explain the chosen architecture pattern ({{ARCHITECTURE}})
- Why this pattern was selected for this project
- Key principles and design decisions
- Trade-offs and considerations

### 3. Architecture Pattern Details

For **MVC (Model-View-Controller)**:
- Models: Data structures and business logic
- Views: UI components and presentation
- Controllers: Request handling and coordination
- Services: Shared business logic

For **Clean Architecture**:
- Domain Layer: Entities and business rules
- Application Layer: Use cases and application logic
- Infrastructure Layer: External services and adapters
- Presentation Layer: UI and API endpoints

For **Flat/Simple**:
- Components: Reusable UI elements
- Hooks: Custom React hooks for logic
- Types: TypeScript interfaces and types
- Utils: Helper functions

For **Feature-Sliced**:
- Features: Self-contained feature modules
- Shared: Common utilities and components
- Entities: Business entities
- Widgets: Composite UI blocks

For **Layered**:
- Presentation: UI and user interaction
- Business: Business logic and rules
- Data: Data access and persistence

### 4. Folder Structure
Explain each main folder:
```
src/
├── [folder1]/     # Purpose and contents
├── [folder2]/     # Purpose and contents
└── [folder3]/     # Purpose and contents
```

### 5. Data Flow
- Explain how data flows through the application
- Request/response cycle
- State management approach
- Side effects handling

### 6. Key Components

List and explain the main components/modules:
- Purpose of each
- Responsibilities
- Dependencies
- Interactions with other parts

### 7. Design Patterns
- Patterns used in this architecture
- Where and why they're applied
- Examples from the codebase

### 8. Scalability Considerations
- How the architecture supports growth
- What to do when the project grows
- Refactoring paths for larger scale

### 9. Testing Strategy
- Unit testing approach
- Integration testing
- E2E testing (if applicable)
- Test file organization

### 10. Best Practices
- Coding conventions
- File naming
- Import organization
- Component structure
- State management rules

### 11. Common Patterns

Example code patterns for this architecture:
```typescript
// Example pattern 1
// Example pattern 2
```

### 12. Anti-Patterns to Avoid
- What NOT to do in this architecture
- Common mistakes
- How to avoid them

### 13. Migration Guide (if project grows)
- When to consider refactoring
- Path to more complex architecture
- What to preserve, what to change

### 14. Footer
**ALWAYS include this exact footer:**

---

**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**

*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*

## Output Format

Return ONLY the markdown content, no code blocks around it, no explanations.
Start directly with the header (# Architecture Documentation).
Be specific to the {{ARCHITECTURE}} pattern chosen.
Include actual folder names from the project structure.
