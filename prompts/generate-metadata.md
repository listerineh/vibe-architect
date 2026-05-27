# Project Metadata Generator

Generate AI-specific metadata for this project to enhance AI assistant comprehension and provide useful insights.

## Project Context

**Description:** {{DESCRIPTION}}
**Framework:** {{FRAMEWORK}}
**Language:** {{LANGUAGE}}
**Backend Service:** {{BACKEND_SERVICE}}
**CSS Framework:** {{CSS_FRAMEWORK}}
**Architecture:** {{ARCHITECTURE}}

## Requirements

Generate a JSON object with three key metadata fields:

### 1. Focus Areas (3-5 items)
Areas where the AI assistant should pay special attention when working with this codebase.

**Examples:**
- `type-safety` - Strict TypeScript usage, type definitions
- `performance` - Optimization, lazy loading, code splitting
- `accessibility` - WCAG compliance, semantic HTML, ARIA
- `testing` - Unit tests, integration tests, E2E tests
- `scalability` - Modular architecture, clean code
- `security` - Input validation, authentication, authorization
- `ai-comprehension` - Clear naming, documentation, structure
- `responsive-design` - Mobile-first, breakpoints
- `seo` - Meta tags, structured data, performance
- `state-management` - Redux, Context, Zustand patterns
- `api-integration` - REST, GraphQL, error handling
- `real-time` - WebSockets, SSE, live updates

**Choose 3-5 that are most relevant to:**
- The project description
- The selected framework ({{FRAMEWORK}})
- The backend service ({{BACKEND_SERVICE}})
- The architecture pattern ({{ARCHITECTURE}})

### 2. Known Limitations (2-4 items)
Things that are NOT implemented or configured yet, that developers should be aware of.

**Examples based on stack:**

**For Firebase projects:**
- "Firebase configuration required in .env.local"
- "Authentication flow needs implementation"
- "Firestore security rules need customization"
- "Firebase Storage bucket not configured"

**For Supabase projects:**
- "Supabase credentials required in .env.local"
- "Database schema needs to be created"
- "Row Level Security policies not configured"
- "Supabase Edge Functions not set up"

**For general projects:**
- "Environment variables need to be set"
- "Database migrations not included"
- "Authentication not implemented"
- "API rate limiting not configured"
- "Error monitoring not set up"
- "CI/CD pipeline not configured"
- "Production deployment guide needed"

**Choose 2-4 limitations that apply to this specific project.**

### 3. Cost Optimizations (3-6 items)
Practical tips to minimize costs and optimize resource usage.

**Examples based on backend:**

**For Firebase:**
- "Use Firebase free tier for development (50K reads/day)"
- "Implement Firestore query pagination to reduce reads"
- "Cache frequently accessed data with React Query"
- "Optimize images with Next.js Image component"
- "Use Firebase Hosting free tier for static assets"
- "Implement incremental static regeneration (ISR)"

**For Supabase:**
- "Use Supabase free tier for development (500MB database)"
- "Implement connection pooling to reduce database connections"
- "Cache API responses with SWR or React Query"
- "Use Supabase CDN for static assets"
- "Optimize database queries with indexes"
- "Enable row-level caching where appropriate"

**For serverless/no backend:**
- "Optimize for serverless deployment (Vercel/Netlify free tier)"
- "Implement code splitting and lazy loading"
- "Use CDN for static assets"
- "Optimize images with modern formats (WebP, AVIF)"
- "Enable browser caching with proper headers"
- "Minimize bundle size with tree shaking"

**General optimizations:**
- "Implement caching strategies (Redis, in-memory)"
- "Use environment-based feature flags"
- "Monitor bundle size with webpack-bundle-analyzer"
- "Implement progressive web app (PWA) features"
- "Use compression (gzip, brotli)"
- "Optimize fonts with font-display: swap"

**Choose 3-6 optimizations relevant to the project's stack and scale.**

## Output Format

Return ONLY a valid JSON object with this exact structure:

```json
{
  "focus_areas": [
    "area-1",
    "area-2",
    "area-3"
  ],
  "known_limitations": [
    "Limitation description 1",
    "Limitation description 2"
  ],
  "cost_optimizations": [
    "Optimization tip 1",
    "Optimization tip 2",
    "Optimization tip 3"
  ]
}
```

**IMPORTANT:**
- Output ONLY the JSON object
- NO markdown code blocks (no ```)
- NO explanatory text before or after
- Be specific to the project's tech stack
- Use clear, actionable language
- Focus on practical, implementable items
