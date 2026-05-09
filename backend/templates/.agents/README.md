# Skills Templates

This directory contains AI agent skills that are automatically included in generated boilerplates based on the selected tech stack.

## Structure

```
.agents/
└── skills/
    ├── accessibility/      # WCAG 2.2, a11y patterns
    ├── frontend-design/    # UI/UX design patterns
    ├── seo/                # SEO optimization
    ├── react/              # React best practices
    ├── nextjs/             # Next.js patterns
    ├── astro/              # Astro development
    ├── typescript/         # TypeScript patterns
    ├── javascript/         # Modern JavaScript
    ├── tailwind/           # Tailwind CSS
    ├── scss/               # SCSS/Sass
    ├── python-fastapi/     # FastAPI patterns
    ├── nodejs/             # Node.js/Express
    ├── postgresql/         # PostgreSQL
    ├── mongodb/            # MongoDB
    └── mysql/              # MySQL
```

## How It Works

When a boilerplate is generated:

1. The backend analyzes the project configuration
2. Detects technologies from `package.json`, file extensions, etc.
3. Copies relevant skills to `.agents/skills/` in the generated ZIP
4. Skills are automatically available to AI assistants in the user's IDE

## Adding New Skills

To add a new skill:

1. Create a new directory: `skills/skill-name/`
2. Add a `SKILL.md` file with the skill content
3. Update `zip_file_generator.py` detection logic if needed
4. Update the main project README

## Detection Logic

Skills are detected in `backend/src/infrastructure/adapters/zip_file_generator.py`:

- **Core skills**: Always included (accessibility, frontend-design, seo)
- **Frontend**: Detected from `package.json` dependencies
- **Languages**: Detected from `tsconfig.json` or file extensions
- **Styling**: Detected from config files or file extensions
- **Backend**: Detected from dependency files
- **Databases**: Detected from file contents

---

**Note**: These skills are templates. The actual skills in the root `.agents/` directory are for this project's development.
