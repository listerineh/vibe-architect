# VibeArchitect Templates

This directory contains base templates for boilerplate generation.

## How It Works

1. **Template files** provide the base structure (components, layouts, etc.)
2. **AI generates** documentation and configuration files
3. **System combines** both to create complete boilerplate

## Template Structure

```
nextjs-base/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with {{PROJECT_NAME}} placeholder
│   │   ├── page.tsx         # Home page with placeholders
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx   # Example UI component
│   │   └── layout/          # Layout components
│   ├── features/            # Feature modules (empty, AI suggests structure)
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── hooks/               # Custom hooks (empty)
│   └── styles/              # Additional styles (empty)
└── public/                  # Static assets (empty)
```

## Placeholders

Templates use double curly braces for placeholders:

- `{{PROJECT_NAME}}` - Replaced with project name
- `{{PROJECT_DESCRIPTION}}` - Replaced with project description

## AI-Generated Files

The AI generates these files based on project requirements:

- `README.md` - Project overview
- `ARCHITECTURE.md` - Architecture decisions
- `KNOWLEDGE_GRAPH.md` - Dependency map
- `CONTRIBUTING.md` - Development guidelines
- `.cursorrules` - AI coding guidelines
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.mjs` - Next.js config
- `tailwind.config.ts` - Tailwind config
- `.env.example` - Environment variables
- `.gitignore` - Git ignore rules

## Benefits

✅ **Consistent structure** - Every project has the same base
✅ **AI-optimized** - Clear organization for AI tools
✅ **Faster generation** - No need to generate boilerplate code
✅ **Customizable docs** - AI tailors documentation to project
✅ **Production-ready** - Complete with all necessary files
