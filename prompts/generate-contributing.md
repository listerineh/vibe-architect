# CONTRIBUTING.md Generator

Generate a comprehensive CONTRIBUTING.md file for this project.

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend:** {{BACKEND_SERVICE}}
**CSS:** {{CSS_FRAMEWORK}}
**Architecture:** {{ARCHITECTURE}}

## Requirements

Generate a detailed CONTRIBUTING.md with:

### 1. Header
```markdown
# Contributing to [Project Name]

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.
```

### 2. Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Welcome newcomers

### 3. Getting Started

#### Prerequisites
- Node.js version
- Package manager
- Git

#### Setup
```bash
# Fork and clone
git clone <your-fork-url>
cd <project-name>

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Development Workflow

#### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

#### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### 5. Code Style

For **{{FRAMEWORK}}** with **{{LANGUAGE}}**:
- Use TypeScript strictly (if applicable)
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for complex functions

For **{{ARCHITECTURE}}** architecture:
- Follow the established folder structure
- Keep components/modules focused
- Maintain separation of concerns

### 6. Testing
- Write tests for new features
- Ensure existing tests pass
- Aim for good coverage
- Test edge cases

### 7. Pull Request Process

1. **Before submitting:**
   - Update documentation
   - Add/update tests
   - Run linter: `npm run lint`
   - Run tests: `npm test`
   - Build successfully: `npm run build`

2. **PR Description:**
   - Clear title
   - Description of changes
   - Related issue number
   - Screenshots (if UI changes)

3. **Review process:**
   - Wait for CI checks
   - Address review comments
   - Keep commits clean

### 8. Project Structure
Explain where to add new code based on {{ARCHITECTURE}}:
- Components/Views
- Business logic
- API calls
- Types/Interfaces
- Tests

### 9. Common Tasks

#### Adding a new component
```typescript
// Example for {{FRAMEWORK}}
```

#### Adding a new API endpoint
```typescript
// Example for {{BACKEND_SERVICE}}
```

#### Adding styles
```css
// Example for {{CSS_FRAMEWORK}}
```

### 10. Resources
- [{{FRAMEWORK}} Documentation](link)
- [{{LANGUAGE}} Best Practices](link)
- Project ARCHITECTURE.md
- Project README.md

### 11. Questions?
- Open an issue
- Check existing discussions
- Review documentation

### 12. Footer
**ALWAYS include this exact footer:**

---

**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**

*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*

## Output Format

Return ONLY the markdown content, no code blocks around it.
Start directly with the header (# Contributing to...).
Be specific to the {{FRAMEWORK}}, {{LANGUAGE}}, and {{ARCHITECTURE}}.
