# KNOWLEDGE_GRAPH.md Generator

Generate a KNOWLEDGE_GRAPH.md file that maps the project structure and dependencies for AI navigation.

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend:** {{BACKEND_SERVICE}}
**CSS:** {{CSS_FRAMEWORK}}
**Architecture:** {{ARCHITECTURE}}
**Project Size:** {{SIZE}}

## Project Structure

```
{{TREE}}
```

## Requirements

Generate a knowledge graph document with:

### 1. Header
```markdown
# Knowledge Graph

This document provides a structured map of the project for AI assistants and developers.
It shows relationships between modules, components, and their dependencies.
```

### 2. Project Overview
- Architecture pattern: {{ARCHITECTURE}}
- Main technology: {{FRAMEWORK}} + {{LANGUAGE}}
- Project complexity: {{SIZE}}

### 3. Directory Structure
Show the complete tree with annotations:
```
src/
├── app/              # Next.js app directory (routing, layouts)
├── components/       # Reusable UI components
├── lib/             # Utility functions and helpers
└── types/           # TypeScript type definitions
```

### 4. Module Dependencies

For **{{ARCHITECTURE}}** architecture, show:

**MVC:**
- Models → Define data structures
- Views → Use Models for display
- Controllers → Coordinate Models and Views
- Services → Shared business logic

**Clean Architecture:**
- Domain → Core business entities (no dependencies)
- Application → Use cases (depends on Domain)
- Infrastructure → External services (depends on Application)
- Presentation → UI layer (depends on Application)

**Flat/Simple:**
- Components → Use hooks and types
- Hooks → Use types and utils
- Types → Standalone definitions
- Utils → Standalone helpers

**Feature-Sliced:**
- Features → Self-contained modules
- Shared → Common utilities
- Entities → Business entities
- Widgets → Composite components

**Layered:**
- Presentation → Calls Business layer
- Business → Calls Data layer
- Data → External data sources

### 5. Key Files

List important files and their purpose:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Styling configuration
- `.env.local` - Environment variables
- Main entry points

### 6. Data Flow

Explain how data flows through the application:
1. User interaction
2. Component handling
3. State management
4. API calls (if applicable)
5. Data transformation
6. UI update

### 7. Component Relationships

Show how major components relate:
```
App Layout
  ├── Header
  ├── Main Content
  │   ├── Feature A
  │   └── Feature B
  └── Footer
```

### 8. External Dependencies

List main npm packages and their purpose:
- `{{FRAMEWORK}}` - Core framework
- `{{LANGUAGE}}` - Language runtime
- `{{CSS_FRAMEWORK}}` - Styling
- `{{BACKEND_SERVICE}}` - Backend services (if any)

### 9. Configuration Files

Explain each config file:
- What it configures
- Key settings
- When to modify

### 10. Entry Points

For AI navigation, list main entry points:
- Application root
- API routes (if any)
- Main components
- Utility modules

### 11. Naming Conventions

Document the naming patterns:
- Files: kebab-case, PascalCase, etc.
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_CASE

### 12. Footer
**ALWAYS include this exact footer:**

---

**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**

*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*

## Output Format

Return ONLY the markdown content, no code blocks around it.
Start directly with the header (# Knowledge Graph).
Be specific to the actual project structure in {{TREE}}.
Focus on making it easy for AI assistants to navigate the codebase.
