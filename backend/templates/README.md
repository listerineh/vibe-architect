# VibeArchitect Templates

This directory contains **minimal base templates** for adaptive boilerplate generation.

## 🎯 New Adaptive System

The system now uses **AI-driven adaptive generation** instead of copying full template structures:

1. **AI analyzes** project requirements and determines appropriate architecture
2. **AI generates** all project files based on complexity (SMALL/MEDIUM/LARGE)
3. **Template matcher** provides only essential base files when exact matches exist
4. **Result**: Perfectly tailored projects without unnecessary boilerplate

## 📁 Template Structure

```
templates/
├── base-files/           # Exact base files (package.json, tsconfig.json, etc.)
│   ├── nextjs/
│   ├── react/
│   └── astro/
├── component-templates/  # Generic component templates with placeholders
│   ├── nextjs/
│   ├── react/
│   └── astro/
├── common-files/         # Framework-agnostic files (.gitignore, etc.)
├── backend-configs/      # Backend service configurations
│   ├── firebase/
│   ├── supabase/
│   └── ...
└── .agents/             # AI skills for generated projects
    └── skills/
```

## 🔄 How It Works

### 1. AI Analysis
- Determines project size (SMALL/MEDIUM/LARGE)
- Proposes appropriate architectures
- Generates complete file tree

### 2. Template Matching
- Matches AI-generated file paths with existing templates
- Uses exact matches for base files (package.json, tsconfig.json)
- Uses pattern matches for components (layout.tsx, page.tsx)

### 3. AI Generation
- Generates all files not found in templates
- Creates project-specific components
- Tailors code to exact requirements

### 4. Assembly
- Combines template files + AI-generated files
- Adds documentation (README, ARCHITECTURE)
- Includes AI skills and backend configs

## 🎨 Placeholders

Templates use double curly braces:

- `{{COMPONENT_NAME}}` - Component name from file path
- `{{HOOK_NAME}}` - Hook name
- `{{PAGE_NAME}}` - Page name
- `{{APP_NAME}}` - Application name
- `{{APP_DESCRIPTION}}` - App description

## ✨ Benefits

✅ **Adaptive** - Projects match their actual complexity
✅ **No bloat** - Only necessary files are generated
✅ **AI-optimized** - Perfect for AI-assisted development
✅ **Flexible** - Supports any architecture pattern
✅ **Production-ready** - Complete with all necessary files

## 🚫 What's NOT Here

We **removed** full template structures (`nextjs-ts/`, `react-ts/`, etc.) because:
- They're no longer used (AI generates everything)
- They caused confusion and bloat
- The new system is more flexible and accurate
