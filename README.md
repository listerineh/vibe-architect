# VibeArchitect

**AI-First Boilerplate Generator for Modern Development**

VibeArchitect generates production-ready project boilerplates optimized for AI-assisted development tools like Cursor and Windsurf. Uses **multiple specialized AI calls** to create high-quality documentation, complete backend integration, and context-aware architectures.

**Latest Update (v2.0.0)**: Now with parallel AI generation, Firebase/Supabase skills, unified preview/download flow, and guaranteed metadata quality!

## 🎯 Core Features

### 🤖 AI-Powered Generation
- **Multiple Specialized AI Calls**: 4 parallel calls for README, ARCHITECTURE, .cursorrules, and metadata
- **8192 Tokens Per Call**: Maximum output for complete, detailed documentation
- **Guaranteed Metadata**: Focus areas, limitations, and cost optimizations always generated
- **Resilient Generation**: Individual fallbacks if any call fails

### �️ Template System
- **Multi-Framework Support**: Next.js, React, and Astro with TypeScript/JavaScript
- **Backend Integration**: Firebase and Supabase with complete auth & database helpers
- **Flexible Styling**: Tailwind CSS or SCSS with pre-configured variables
- **36 Combinations**: Every framework × language × backend × styling option

### 📚 Skills & Documentation
- **AI Skills Auto-Included**: Firebase, Supabase, React, Next.js, TypeScript, etc.
- **VibeArchitect Branding**: Professional footer on all .md files
- **Complete Guides**: Authentication, CRUD, real-time, security, best practices
- **Context-Ready**: Optimized for Cursor, Windsurf, and other AI assistants

### ⚡ Optimized Workflow
- **Unified Preview → Download**: Preview generates everything, download is instant
- **In-Memory Caching**: 30-minute TTL for fast downloads
- **~40 Files Per Project**: Templates + AI docs + backend configs
- **Production-Ready**: Complete with auth flows, CRUD helpers, environment configs

## 🏗️ Architecture

```
VibeArchitect/
├── backend/                    # FastAPI service (Python)
│   ├── src/
│   │   ├── domain/            # Business entities
│   │   ├── application/       # Use cases
│   │   ├── infrastructure/    # External services
│   │   └── presentation/      # API endpoints
│   └── templates/             # Project templates
│       ├── nextjs-ts/         # Next.js TypeScript
│       ├── nextjs-js/         # Next.js JavaScript
│       ├── react-ts/          # React TypeScript
│       ├── react-js/          # React JavaScript
│       ├── astro-ts/          # Astro TypeScript
│       ├── astro-js/          # Astro JavaScript
│       └── backend-configs/   # Firebase & Supabase configs
│           ├── firebase/
│           │   ├── typescript/
│           │   └── javascript/
│           └── supabase/
│               ├── typescript/
│               └── javascript/
├── frontend/                  # Next.js UI
│   └── components/           # React components
└── prompts/                  # AI system prompts
```

## 🚀 Tech Stack

### Backend
- **FastAPI** (Python 3.11+)
- **Google AI Studio** (Gemini 2.5 Flash)
- **Clean Architecture** (Domain, Application, Infrastructure, Presentation)
- **Multiple AI Calls** (Parallel generation with asyncio)
- **In-Memory Caching** (Preview/download optimization)
- **Template Service** (Physical templates + AI documentation)

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (Strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Lucide Icons**
- **React 19**

### Generated Templates Support
- **Frameworks**: Next.js, React, Astro
- **Languages**: TypeScript, JavaScript
- **Backends**: Firebase, Supabase, None
- **Styling**: Tailwind CSS, SCSS
- **Total Combinations**: 36 unique configurations

## 📦 Template Configurations

### Framework Options
- **Next.js** - Full-stack React framework with App Router
- **React** - SPA with Vite
- **Astro** - Static site generator with islands architecture

### Language Options
- **TypeScript** - Type-safe development with strict mode
- **JavaScript** - Modern ES2024+ syntax

### Backend Options
- **Firebase** - Complete auth, Firestore, Storage, Analytics
  - `firebase.ts` - SDK initialization
  - `firebase.auth.ts` - Authentication helpers
  - `firebase.helpers.ts` - CRUD operations
  - `firebase.types.ts` - TypeScript definitions
- **Supabase** - PostgreSQL, auth, storage, real-time
  - `supabase.ts` - Client initialization
  - `supabase.auth.ts` - Auth + OAuth helpers
  - `supabase.helpers.ts` - Database operations
  - `supabase.types.ts` - TypeScript definitions
- **None** - No backend integration

### Styling Options
- **Tailwind CSS** - Utility-first CSS (default)
- **SCSS** - Sass with variables and mixins

### AI Skills (Auto-Included)
Each boilerplate includes specialized AI skills based on your tech stack:

**Core Skills** (Always included):
- ✅ **Accessibility** - WCAG 2.2 guidelines, ARIA best practices
- ✅ **Frontend Design** - Modern UI/UX patterns, design systems
- ✅ **SEO** - Meta tags, structured data, performance optimization

**Tech-Specific Skills** (Auto-detected):
- 🎯 **React** - Hooks, performance, state management
- 🎯 **Next.js** - App Router, SSR/SSG, routing patterns
- 🎯 **Astro** - Islands architecture, content collections
- 🎯 **TypeScript** - Advanced types, generics, best practices
- 🎯 **JavaScript** - ES6+, async patterns, modern features
- 🎯 **Tailwind CSS** - Utility-first, responsive design, customization
- 🎯 **SCSS** - Mixins, functions, architecture patterns
- 🎯 **PostgreSQL** - Schema design, query optimization, indexing
- 🎯 **MongoDB** - Document modeling, aggregations, performance
- 🎯 **MySQL** - Relational design, stored procedures, optimization
- 🎯 **Firebase** - Auth, Firestore, Storage, Security Rules, best practices
- 🎯 **Supabase** - PostgreSQL, RLS, Auth, real-time, best practices
- 🎯 **Node.js/Express** - Middleware, async patterns, error handling
- 🎯 **Python/FastAPI** - Type hints, dependency injection, async APIs

**Location**: `.agents/skills/` directory in your generated project

### Generated Files
Each boilerplate includes **~40 files**:

**AI-Generated Documentation** (4 parallel calls):
- ✅ **README.md** - Comprehensive overview with badges, setup, and deployment
- ✅ **ARCHITECTURE.md** - Detailed design decisions and patterns
- ✅ **.cursorrules** - AI coding guidelines specific to your stack
- ✅ **Metadata** - Focus areas, known limitations, cost optimizations

**Backend-Generated**:
- ✅ **CONTRIBUTING.md** - AI-friendly contribution guide (12 sections)
- ✅ **KNOWLEDGE_GRAPH.md** - Project structure and dependencies

**Template Files** (~24 files):
- ✅ Complete project structure (src/, public/, etc.)
- ✅ package.json with all dependencies
- ✅ TypeScript/ESLint configurations
- ✅ Component placeholders with TODOs

**Backend Configs** (when selected):
- ✅ Firebase: `src/lib/firebase.ts`, auth, helpers, types
- ✅ Supabase: `src/lib/supabase.ts`, auth, helpers, types
- ✅ Environment variable templates

**AI Skills** (auto-included):
- ✅ `.agents/skills/firebase/SKILL.md` (6.4 KB guide)
- ✅ `.agents/skills/supabase/SKILL.md` (8.4 KB guide)
- ✅ Framework, language, and styling skills

**Branding**:
- ✅ All .md files include VibeArchitect footer

## 🛠️ Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your GCP credentials

# Run development server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

### Testing Template Generation

```bash
# Test backend template service
cd backend
python -c "
from pathlib import Path
from src.infrastructure.services.template_service import TemplateService

service = TemplateService(Path('templates'))
structure = service.get_project_structure('react', 'typescript', 'supabase', 'tailwind')
print(structure)
"
```

## 📊 Project Statistics

### Template System
- **Base Templates**: 6 (Next.js, React, Astro × TS/JS)
- **Backend Configs**: 18 files (Firebase + Supabase × TS/JS)
- **Supported Combinations**: 36 unique configurations
- **Skills Guides**: 18+ technology-specific guides

### AI Generation
- **Calls Per Generation**: 4 (parallel)
- **Tokens Per Call**: 8192 max
- **Total Output**: ~10.5K tokens per project
- **Generation Time**: ~3-4 seconds (parallel)

### Output Quality
- **Files Per Project**: ~40 (24 template + 11 AI + 5 backend)
- **Documentation**: 6 comprehensive .md files
- **Metadata**: 100% guaranteed (focus areas, limitations, optimizations)
- **Branding**: All .md files include VibeArchitect footer

### Codebase
- **Backend Lines**: ~8,000+ (Clean Architecture)
- **Frontend Lines**: ~7,000+ (Next.js + React)
- **Total Lines**: ~15,000+

## 🎯 Roadmap

### Phase 1: MVP ✅
- [x] Basic Next.js template generation
- [x] Firebase integration
- [x] Frontend UI
- [x] GCP deployment

### Phase 2: Multi-Framework ✅
- [x] React template support
- [x] Astro template support
- [x] TypeScript/JavaScript variants
- [x] Supabase integration
- [x] SCSS support

### Phase 2.5: AI Optimization ✅ (May 9, 2026)
- [x] Multiple specialized AI calls (4 parallel)
- [x] Firebase & Supabase skills guides
- [x] Unified preview/download flow with caching
- [x] VibeArchitect branding on all .md files
- [x] Guaranteed metadata generation
- [x] CONTRIBUTING.md backend-generated
- [x] Complete file structure in preview

### Phase 3: Enhanced Features 🚧
- [ ] Streaming AI responses to frontend
- [ ] Progressive file generation display
- [ ] Custom component library
- [ ] Database schema generation
- [ ] API route scaffolding
- [ ] Testing setup (Jest, Vitest, Playwright)
- [ ] AI-powered code review

### Phase 4: Advanced 📋
- [ ] Monorepo support (Turborepo, Nx)
- [ ] Docker configurations
- [ ] CI/CD templates
- [ ] More backends (AWS Amplify, Appwrite)
- [ ] More frameworks (Vue, Svelte, Solid)

## 🎯 What Makes This Special?

### Traditional Boilerplate Generators
```bash
npx create-next-app my-app
# Generic structure, no AI optimization, manual backend setup
```

### VibeArchitect
```bash
# 1. Select: Framework, Language, Backend, Styling
# 2. Preview: See complete structure (~40 files)
# 3. Download: Instant ZIP with everything configured
```

**Key Differences**:
- ✅ **AI-Optimized**: Multiple specialized calls for quality
- ✅ **Complete Backend**: Firebase/Supabase fully configured
- ✅ **Skills Included**: Technology-specific best practices
- ✅ **Guaranteed Quality**: Metadata always generated
- ✅ **Instant Download**: Cached for speed
- ✅ **Professional**: Branded documentation

## 🚀 Quick Start

### For Users
1. Visit the VibeArchitect web app
2. Enter your project description
3. Select tech stack (framework, language, backend, styling)
4. Click **Preview** to see the complete structure
5. Click **Download** to get your ZIP instantly
6. Extract and start coding with AI assistance!

### For Developers
See [Development](#🛠️-development) section above.

## 📚 Documentation

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Roadmap and completed features
- **[.cursorrules](.cursorrules)** - AI development guidelines

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📝 License

MIT License - feel free to use this for your projects!

---

**Built with ❤️ for AI-assisted development**

**Version**: 2.0.0 | **Last Updated**: May 9, 2026 | **Status**: Production Ready ✅
