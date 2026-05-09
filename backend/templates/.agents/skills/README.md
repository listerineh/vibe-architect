# VibeArchitect Skills

This directory contains AI agent skills that provide best practices, patterns, and guidelines for various technologies and frameworks. These skills are automatically included in generated boilerplates based on the selected tech stack.

## 📚 Available Skills

### Core Skills (Always Included)

These skills are included in every generated boilerplate:

- **`accessibility/`** - WCAG 2.2 compliance, a11y patterns, screen reader support
- **`frontend-design/`** - Production-grade UI/UX design patterns and aesthetics
- **`seo/`** - Search engine optimization, meta tags, structured data

### Frontend Framework Skills

Automatically included based on your project's frontend framework:

- **`react/`** - React hooks, state management, performance optimization, TypeScript patterns
- **`nextjs/`** - Next.js App Router, SSR/SSG, routing, server components, data fetching
- **`astro/`** - Islands architecture, content collections, performance optimization

### Language Skills

Automatically included based on your project's language:

- **`typescript/`** - Type safety, advanced types, generics, utility types, configuration
- **`javascript/`** - Modern ES6+, async/await, functional programming, best practices

### Styling Skills

Automatically included based on your project's styling approach:

- **`tailwind/`** - Utility-first CSS, responsive design, components, dark mode
- **`scss/`** - Variables, mixins, functions, BEM methodology, architecture

### Backend Framework Skills

Automatically included based on your project's backend framework:

- **`python-fastapi/`** - FastAPI async patterns, Pydantic models, dependency injection, testing
- **`nodejs/`** - Express.js middleware, error handling, async patterns, project structure

### Database Skills

Automatically included based on database usage detected in your project:

- **`postgresql/`** - Schema design, indexing, query optimization, transactions, performance tuning
- **`mongodb/`** - Document modeling, aggregations, indexing, performance optimization
- **`mysql/`** - Schema design, query optimization, indexing, transactions, performance

## 🎯 How Skills Are Selected

When you generate a boilerplate, VibeArchitect automatically detects your tech stack and includes relevant skills:

### Detection Logic

**Frontend Frameworks:**
1. **React** - Detected from `package.json` containing `"react"`
2. **Next.js** - Detected from `package.json` containing `"next"`
3. **Astro** - Detected from `package.json` containing `"astro"`

**Languages:**
4. **TypeScript** - Detected from `package.json` containing `"typescript"` or presence of `tsconfig.json`
5. **JavaScript** - Included by default if TypeScript is not detected

**Styling:**
6. **Tailwind CSS** - Detected from `package.json` containing `"tailwindcss"` or presence of `tailwind.config`
7. **SCSS** - Detected from presence of `.scss` or `.sass` files

**Backend Frameworks:**
8. **Node.js/Express** - Detected from `package.json` containing `"express"`
9. **Python/FastAPI** - Detected from `requirements.txt` or `pyproject.toml` containing `"fastapi"`

**Databases:**
10. **PostgreSQL** - Detected from file contents containing `postgresql`, `psycopg`, or `postgres`
11. **MongoDB** - Detected from file contents containing `mongodb`, `mongoose`, or `mongo`
12. **MySQL** - Detected from file contents containing `mysql` or `mysql2`

### Example

If you generate a Next.js project with React, TypeScript, and Tailwind CSS, your boilerplate will include:

```
.agents/
└── skills/
    ├── accessibility/      # ✅ Core skill
    ├── frontend-design/    # ✅ Core skill
    ├── seo/                # ✅ Core skill
    ├── react/              # ✅ Auto-detected from package.json
    ├── nextjs/             # ✅ Auto-detected from package.json
    ├── typescript/         # ✅ Auto-detected from tsconfig.json
    └── tailwind/           # ✅ Auto-detected from tailwind.config
```

## 📖 Using Skills

Skills are designed to be used with AI coding assistants like Cascade, Cursor, or GitHub Copilot. They provide:

- **Best Practices** - Industry-standard patterns and conventions
- **Code Examples** - Copy-paste ready code snippets
- **Common Pitfalls** - What to avoid and why
- **Testing Patterns** - How to test your code effectively
- **Performance Tips** - Optimization strategies

### In Your IDE

Most AI assistants will automatically recognize and use skills in the `.agents/skills/` directory. You can also:

1. **Reference directly**: `@accessibility` or `@react` in your prompts
2. **Ask for guidance**: "How should I handle form validation?" (AI will consult relevant skills)
3. **Request patterns**: "Show me the compound component pattern" (AI will reference React skill)

## 🔧 Skill Structure

Each skill follows this structure:

```
skill-name/
├── SKILL.md           # Main skill documentation
└── references/        # Optional: Additional reference materials
    └── PATTERNS.md
```

### Skill Metadata

Each `SKILL.md` file includes frontmatter:

```yaml
---
name: skill-name
description: Brief description of what this skill covers
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---
```

## 🚀 Future Skills

Planned skills for future releases:

- **Database Skills**
  - `postgresql/` - Schema design, indexing, query optimization
  - `mongodb/` - Document modeling, aggregations, performance
  - `mysql/` - Normalization, relationships, optimization

- **Additional Frontend**
  - `vue/` - Vue 3 Composition API, Pinia, best practices
  - `svelte/` - Svelte/SvelteKit patterns and optimization

- **Additional Backend**
  - `golang/` - Go concurrency, error handling, project layout
  - `django/` - Django ORM, views, middleware, testing

- **DevOps & Tools**
  - `docker/` - Containerization best practices
  - `testing/` - Testing strategies across frameworks
  - `security/` - Security best practices and OWASP guidelines

## 📝 Contributing

To add a new skill:

1. Create a directory in `.agents/skills/`
2. Add a `SKILL.md` file with proper frontmatter
3. Include code examples, best practices, and common pitfalls
4. Update this README
5. Update `zip_file_generator.py` detection logic if needed

## 📄 License

All skills are licensed under MIT unless otherwise specified in the skill's frontmatter.

---

**Generated by VibeArchitect** - AI-powered boilerplate generator
