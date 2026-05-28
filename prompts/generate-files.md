# File Content Generator

You are generating file contents for a {{SIZE}} complexity project using **{{ARCHITECTURE}}** architecture.

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend:** {{BACKEND_SERVICE}}
**CSS:** {{CSS_FRAMEWORK}}
**Architecture:** {{ARCHITECTURE}}

## CRITICAL: Follow Architecture Pattern

Generate files according to the **{{ARCHITECTURE}}** architecture:

- **Flat/Simple**: Components in `components/`, hooks in `hooks/`, types in `types/`
- **MVC**: Models in `models/`, Views in `views/`, Controllers in `controllers/`, Services in `services/`
- **Clean Architecture**: Domain in `domain/`, Application in `application/`, Infrastructure in `infrastructure/`
- **Feature-Sliced**: Features in `features/[name]/ui/`, `features/[name]/model/`, `features/[name]/lib/`
- **Layered**: Presentation in `presentation/`, Business in `business/`, Data in `data/`

## Project Structure

The complete project structure is:
```
{{TREE}}
```

## Files to Generate

Generate content for these files:
{{FILES_TO_GENERATE}}

## ⚠️ CRITICAL: Files to EXCLUDE

**NEVER generate or include these in your output:**
- `node_modules/` - Dependencies folder
- `.next/` - Next.js build output
- `dist/` or `build/` - Build output folders
- `.git/` - Git repository files
- `package-lock.json` or `yarn.lock` - Lock files (too large)
- `.env` files - Environment variables (security)
- Any binary files or images
- Cache folders (`.cache/`, `.turbo/`, etc.)

**ONLY generate source code files** that are part of the boilerplate starter project.

## Requirements

### 🎯 CRITICAL: Generate BOILERPLATE Code Only

This is a **STARTER PROJECT** - generate minimal, foundational code that developers will extend.

1. **Code Length Limits** (STRICT):
   - **SMALL files**: 20-50 lines (components, utilities, types)
   - **MEDIUM files**: 50-80 lines (pages, services, hooks)
   - **NEVER exceed**: 100 lines per file
   - Use `// TODO: Implement X` for complex features

2. **What to Include** ✅:
   - Essential imports and exports
   - Type definitions and interfaces
   - Basic component/function structure
   - Placeholder functions with proper signatures
   - Simple, foundational logic only

3. **What to AVOID** ❌:
   - Full implementations of complex algorithms
   - Extensive validation logic
   - Multiple edge case handling
   - Long comment blocks or documentation
   - Complete business logic

4. **Consistency**:
   - Match the project structure
   - Use consistent naming conventions
   - Import from correct paths

5. **Framework-Specific**:
   - **Next.js**: Use app router conventions, server/client components appropriately
   - **React**: Use Vite as build tool (NOT Next.js), functional components, hooks, proper state management
   - **Astro**: Use Astro components, proper frontmatter
   
6. **Build Tool Selection**:
   - **React projects**: Use Vite (`vite.config.ts`, `index.html` at root)
   - **Next.js projects**: Use Next.js conventions (`next.config.js`, app router)
   - DO NOT mix Next.js conventions in plain React projects

## Output Format

Return ONLY valid JSON (no markdown, no code blocks):

```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\n\nexport default function App() {\n  return <div>Hello</div>;\n}"
    },
    {
      "path": "src/components/Header.tsx",
      "content": "..."
    }
  ]
}
```

## Important Rules

1. **JSON Safety** (CRITICAL):
   - **ESCAPE** all special characters: `\n` for newlines, `\"` for quotes, `\\` for backslashes
   - **TEST** your JSON is valid before responding
   - **NO** unescaped quotes, newlines, or backslashes in content strings

2. **Boilerplate Code**:
   - Keep files **SHORT** (20-80 lines max)
   - Use `// TODO: Implement X` for complex features
   - Focus on **structure and types**, not full implementations

3. **Correct imports**: Use proper import paths based on project structure

4. **Match complexity**: {{SIZE}} projects should have appropriate complexity level

5. **Generate ALL files**: Every file in the list must be generated

## Examples

### SMALL Project File
```json
{
  "files": [
    {
      "path": "src/components/TodoItem.tsx",
      "content": "interface TodoItemProps {\n  id: string;\n  text: string;\n  completed: boolean;\n  onToggle: (id: string) => void;\n  onDelete: (id: string) => void;\n}\n\nexport function TodoItem({ id, text, completed, onToggle, onDelete }: TodoItemProps) {\n  return (\n    <div className=\"flex items-center gap-2 p-2 border rounded\">\n      <input\n        type=\"checkbox\"\n        checked={completed}\n        onChange={() => onToggle(id)}\n      />\n      <span className={completed ? 'line-through' : ''}>{text}</span>\n      <button onClick={() => onDelete(id)}>Delete</button>\n    </div>\n  );\n}"
    }
  ]
}
```

Now generate the files. Return ONLY the JSON output.
