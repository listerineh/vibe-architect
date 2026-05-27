# README Generator

Generate a comprehensive, professional README.md for this project.

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

Generate a **production-ready README.md** with:

### 1. Header
- Project title (from description)
- Brief tagline/description
- Badges (optional): Tech stack, license, etc.

### 2. Overview
- What the project does
- Key features (3-5 bullet points)
- Target audience/use case

### 3. Tech Stack
- Framework and version
- Language
- Styling solution
- Backend/database (if any)
- Key dependencies

### 4. Architecture
- Brief explanation of the chosen architecture ({{ARCHITECTURE}})
- Why this architecture fits the project
- Main folders and their purpose

### 5. Getting Started

#### Prerequisites
- Node.js version
- Package manager (npm/yarn/pnpm)
- Any other requirements

#### Installation
```bash
# Clone the repository
git clone <repo-url>
cd <project-name>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

#### Environment Variables
- List all required env vars
- Explain what each one does
- Provide example values (safe ones)

### 6. Project Structure
- Show the main folders
- Explain what each folder contains
- Highlight important files

### 7. Development

#### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Linting
- `npm run test` - Tests (if applicable)

#### Code Style
- Mention linting/formatting tools
- Any coding conventions

### 8. Deployment
- Quick deployment guide
- Recommended platforms (Vercel, Netlify, etc.)
- Build command and output directory

### 9. Contributing (optional for small projects)
- How to contribute
- Pull request process

### 10. License
- License type (MIT recommended)

### 11. Footer
**ALWAYS include this exact footer:**

---

**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**

*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*

## Output Format

Return ONLY the markdown content, no code blocks, no explanations.
Start directly with the project title header (# Project Name).
