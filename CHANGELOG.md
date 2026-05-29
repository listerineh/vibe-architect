# Changelog

All notable changes to VibeArchitect will be documented in this file.

## [v2.0.3-alpha] - 2026-05-29

### 🚀 Production Deployment

#### Backend (Cloud Run)
- ✅ Deployed to Google Cloud Run
- ✅ Vertex AI integration working
- ✅ Firebase Admin SDK configured
- ✅ CORS configured for production
- ✅ Multi-separator support for CORS origins (`,`, `;`, `|`)
- ✅ All endpoints tested and operational

#### Frontend (Vercel)
- ✅ Deployed to Vercel
- ✅ Production environment variables configured
- ✅ Connected to Cloud Run backend
- ✅ Firebase authentication ready

#### Bug Fixes
- 🐛 Fixed enum `.value` error in routes
- 🐛 Added missing `firebase-admin` dependency
- 🐛 Fixed Docker build to include `/prompts` folder
- 🐛 Fixed TypeScript errors in frontend forms
- 🐛 Fixed CORS preflight requests

#### CI/CD
- ✅ GitHub Actions workflows created
- ✅ Auto-deploy on push to main
- ✅ Separate workflows for backend and frontend

---

## [v0.2.2-alpha] - 2026-05-28

### 🎉 Major Features - User Management & Cloud Deployment

#### User Authentication & Project Management
- **Firebase Authentication**: Google Sign-In integration
  - Secure authentication flow with Firebase Auth
  - Protected routes requiring authentication
  - User context management across the app
- **Project History**: Auto-save all generated projects
  - Projects automatically saved to Firebase Storage
  - Firestore metadata storage (name, framework, architecture, file count, etc.)
  - Personal project dashboard at `/projects`
- **Project Details Page**: Rich project information display
  - View complete project metadata
  - Interactive file tree visualization
  - Tech stack badges and architecture info
  - Download projects anytime from history
  - Creation date and file statistics

#### Interactive File Tree Component
- **FileTree Component**: Hierarchical file structure visualization
  - Expandable/collapsable folders
  - File type icons with color coding (`.tsx`, `.js`, `.json`, `.md`, etc.)
  - Auto-expansion of first 2 levels
  - Smooth animations and hover effects
  - Indentation-based hierarchy display

#### Cloud Run Deployment Configuration
- **Docker Setup**: Production-ready Dockerfile
  - Python 3.12 slim base image
  - Non-root user for security
  - Health check endpoint
  - Optimized layer caching
- **Deployment Scripts**: One-command deployment
  - `deploy.sh` for quick Cloud Run deployment
  - `cloudbuild.yaml` for CI/CD automation
  - Comprehensive `.dockerignore` for build optimization
- **Environment Configuration**: Production-ready settings
  - Updated `.env.example` with Cloud Run variables
  - CORS configuration for Vercel integration
  - Dynamic environment variable support

#### UI/UX Improvements
- **Analysis Phase Indicator**: Dedicated UI for initial project analysis
  - Sparkle icon with pulse animation
  - Three-step progress indicators
  - Gradient background with backdrop blur
  - Clear messaging before architecture selection
- **Progress Bar Optimization**: Only shows during actual generation
  - Prevents confusion with restarting progress
  - Clearer separation between analysis and generation phases

#### Backend Enhancements
- **Skill Detection Logging**: Detailed logging for backend service skills
  - Debug logs for backend service detection
  - Skill addition confirmation logs
  - File count tracking per skill
- **Example Structure Validation**: Automatic truncation to 15 items
  - Prevents Pydantic validation errors
  - Warning logs when truncating
  - Maintains most important files in examples
- **Prompt Improvements**: Better AI instructions
  - Explicit exclusion of `node_modules/`, `.next/`, `dist/`, etc.
  - Vite as default for React projects (not Next.js)
  - Clear build tool selection guidelines

### 🔧 Technical Improvements
- **Firebase Integration**: Complete backend integration
  - Firebase Admin SDK for authentication
  - Firestore for metadata storage
  - Firebase Storage for ZIP files
  - Security rules for user data isolation
- **Type Safety**: Enhanced TypeScript types
  - `ProjectDetails` interface with complete metadata
  - Proper typing for file tree structure
  - Auth context types
- **Error Handling**: Improved error management
  - Graceful handling of missing skills
  - Validation error prevention
  - User-friendly error messages

### 📊 Performance & Cost
- **Auto-Save**: No manual save required
  - Projects saved immediately after generation
  - Reduces user friction
  - Enables project history feature
- **Firebase Free Tier**: Cost-effective storage
  - 5GB storage free
  - 1GB/day download free
  - Firestore 50K reads/day free

### 🎨 UI Components
- **New Components**:
  - `FileTree`: Interactive file structure display
  - Analysis phase indicator with animations
  - Project details page layout
  - Project card grid for dashboard
- **Design Consistency**:
  - Zinc color palette throughout
  - Indigo/purple gradients
  - Smooth Framer Motion animations
  - Responsive layouts

### 📝 Documentation
- **DEPLOYMENT.md**: Complete deployment guide
  - Cloud Run setup instructions
  - Vercel deployment steps
  - Environment variable configuration
  - Cost optimization tips
  - Monitoring and troubleshooting
- **Updated README**: New features documented
- **Updated Architecture Docs**: Deployment section added

### 🐛 Bug Fixes
- Fixed infinite API call loop in project details page
- Fixed Pydantic validation error for example_structure > 15 items
- Fixed backend service skill detection logic
- Improved CORS configuration for production

---

## [v0.2.1-alpha] - 2026-05-27

### 🎉 Major Features - Adaptive Architecture & Real-Time Streaming

#### Adaptive Architecture System
- **Project Complexity Analysis**: AI analyzes project description and determines size (SMALL/MEDIUM/LARGE)
- **Multiple Architecture Proposals**: System proposes 2-4 suitable architectures based on complexity
  - Supported patterns: Flat, MVC, Feature-Sliced, Layered, Clean Architecture, Hexagonal, Modular
- **Visual Architecture Selection**: User chooses from interactive cards showing:
  - Architecture name and complexity level
  - Reasoning for recommendation
  - Estimated file count
  - Pros and cons
  - Example file structure preview
- **Recommended Badge**: AI highlights the best-fit architecture

#### Intelligent Template Matching
- **Template Matcher Service**: New service that reuses existing templates
  - Exact matching for common files (package.json, tsconfig.json, etc.)
  - Pattern matching for components, pages, layouts
  - Placeholder replacement system for customization
- **Hybrid Generation**: 60-80% from templates (fast), 20-40% from AI (cost-effective)
- **Three-Tier Template System**:
  - `base-files/`: Framework-specific configurations
  - `common-files/`: Shared across all projects (.gitignore, .prettierrc)
  - `component-templates/`: Reusable patterns with placeholders

#### Real-Time Streaming Progress
- **Server-Sent Events (SSE)**: Backend streams progress updates to frontend
- **Progress Events**:
  - `started`: Generation begins (0%)
  - `progress`: Incremental updates with messages (10%, 30%, 60%, etc.)
  - `architectures_proposed`: AI sends architecture options (30%)
  - `complete`: Generation finished (100%)
  - `error`: Failure with error message
- **Visual Progress Bar**: Animated 0-100% with shimmer effect
- **Step Indicators**: Shows current phase (Analyzing → Architecture → Templates → Generating → Finalizing)
- **Status Icons**: Loading spinner, success checkmark, error alert

#### New Use Cases & Entities
- **AnalyzeProjectUseCase**: Determines project complexity and requirements
- **GenerateAdaptiveBoilerplateUseCase**: Orchestrates full adaptive generation flow
- **ProjectAnalysis Entity**: Stores complexity analysis results
- **ArchitectureProposal Entity**: Represents architecture options with metadata

#### New AI Prompts
- `analyze-complexity.md`: 5KB prompt for project size analysis
- `propose-architectures.md`: 8KB prompt for architecture recommendations
- `generate-files.md`: 3KB prompt for missing file generation

#### API Endpoints
- `POST /api/analyze-project`: Analyze project complexity
- `POST /api/propose-architectures`: Get architecture proposals
- `POST /api/generate-streaming`: Stream generation progress with SSE
- `POST /api/preview-adaptive`: Preview with adaptive architecture

#### Frontend Components
- **ArchitectureSelector**: Interactive cards for architecture selection
  - Responsive grid layout (1 col mobile, 2 cols desktop)
  - Hover effects and selection indicators
  - Collapsible file structure preview
- **GenerationProgress**: Real-time progress visualization
  - Animated progress bar with gradient
  - Current step and percentage display
  - Shimmer loading effect
- **useStreamingGeneration Hook**: Manages SSE connection and state
  - Handles streaming events
  - Parses JSON progress updates
  - Manages architecture proposals and session ID

#### Design System Updates
- **Consistent Zinc Color Palette**: All components use zinc-950/900/800/400/100
- **Indigo/Purple Gradients**: Replaced purple/pink with indigo/purple
- **Alpha Banner**: Included on generator page
- **English Localization**: All UI text in English for consistency

### 🔧 Technical Improvements
- **Clean Architecture**: Maintained separation of concerns across all layers
- **Type Safety**: Full TypeScript types for all new entities and DTOs
- **Error Handling**: Graceful fallbacks for streaming failures
- **Memory Efficiency**: Streaming reduces memory usage vs full response
- **Cost Optimization**: Template reuse reduces AI API calls by 60-80%

### 📊 Performance Metrics
- **Generation Speed**: ~3-5 seconds for adaptive analysis + proposals
- **Template Matching**: <100ms for exact matches
- **Streaming Latency**: <50ms per progress event
- **Cost Reduction**: 60-80% fewer AI tokens used

### 🎨 UI/UX Enhancements
- **Real-Time Feedback**: Users see progress instead of waiting blindly
- **Informed Decisions**: Detailed architecture info helps users choose
- **Professional Design**: Consistent zinc theme with smooth animations
- **Responsive Layout**: Works on mobile, tablet, and desktop

### 📝 Documentation Updates
- Updated README.md to v0.2.1-alpha
- Added architecture system documentation
- Included streaming flow diagrams
- Updated roadmap with completed Phase 3

---

## [v0.2.0-alpha] - 2026-05-09

### Added
- Multiple specialized AI calls (4 parallel)
- Firebase & Supabase skills guides
- Unified preview/download flow with caching
- VibeArchitect branding on all .md files
- Guaranteed metadata generation
- CONTRIBUTING.md backend-generated
- Complete file structure in preview

---

## [v0.1.0-alpha] - 2026-04-15

### Initial Release
- Basic Next.js template generation
- Firebase integration
- Frontend UI
- GCP deployment
- React and Astro support
- TypeScript/JavaScript variants
- Supabase integration
- SCSS support

---

**Version**: v2.0.3-alpha | **Last Updated**: May 29, 2026
