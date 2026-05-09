# Components Structure

This directory contains all React components organized by their purpose and functionality.

## Directory Structure

```
components/
├── ui/              # Reusable UI components
│   ├── glass-card.tsx
│   ├── error-banner.tsx
│   └── tech-icons.tsx
├── forms/           # Form components
│   ├── minimal-form.tsx
│   ├── enhanced-project-form.tsx
│   ├── project-form.tsx
│   └── google-mode-toggle.tsx
├── preview/         # Preview and summary components
│   ├── streaming-preview.tsx
│   ├── preview-panel.tsx
│   └── project-summary.tsx
├── layout/          # Layout components
│   └── 3d-background.tsx
├── providers/       # Context providers
│   └── error-provider.tsx
└── seo/            # SEO components
    └── structured-data.tsx
```

## Usage

Import components using the barrel exports:

```tsx
// UI components
import { GlassCard, ErrorBanner } from '@/components/ui'

// Forms
import { MinimalForm, GoogleModeToggle } from '@/components/forms'

// Preview components
import { StreamingPreview, ProjectSummary } from '@/components/preview'

// Layout
import { Background3D } from '@/components/layout'

// Providers
import { ErrorProvider, useError } from '@/components/providers'

// SEO
import { StructuredData } from '@/components/seo'
```

## Guidelines

- **ui/**: Generic, reusable components that can be used across the app
- **forms/**: Form-specific components and form controls
- **preview/**: Components related to previewing and displaying generated content
- **layout/**: Components that define the layout structure
- **providers/**: React context providers for global state
- **seo/**: Components for SEO optimization (structured data, meta tags, etc.)
