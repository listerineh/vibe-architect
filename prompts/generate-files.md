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

## Requirements

1. **Production-Ready Code**:
   - Clean, well-structured code
   - Proper imports and exports
   - Type-safe (if TypeScript)
   - Follow framework best practices

2. **Consistency**:
   - Match the project structure
   - Use consistent naming conventions
   - Import from correct paths

3. **Completeness**:
   - Include all necessary imports
   - Add proper types/interfaces
   - Include basic error handling where needed

4. **Comments**:
   - Only add comments where truly necessary
   - Prefer self-documenting code
   - No placeholder comments like "// Add logic here"

5. **Framework-Specific**:
   - **Next.js**: Use app router conventions, server/client components appropriately
   - **React**: Use functional components, hooks, proper state management
   - **Astro**: Use Astro components, proper frontmatter

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

1. **Escape properly**: Use `\n` for newlines, `\"` for quotes in JSON
2. **Complete files**: Each file must be fully functional
3. **Correct imports**: Use proper import paths based on project structure
4. **No placeholders**: Don't use "// TODO" or "// Implement this"
5. **Match complexity**: {{SIZE}} projects should have appropriate complexity level

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
