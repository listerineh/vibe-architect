---
name: astro
description: Astro best practices for content-focused sites, islands architecture, and performance optimization. Use when working with Astro projects.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# Astro Development Guide

Modern Astro development with islands architecture, content collections, and performance optimization.

## Core Concepts

1. **Zero JS by Default** - Ship only the JavaScript you need
2. **Islands Architecture** - Interactive components in a sea of static HTML
3. **Content Collections** - Type-safe content management
4. **Framework Agnostic** - Use React, Vue, Svelte, or any framework

---

## Project Structure

```
project/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── Card.astro
│   ├── layouts/          # Page layouts
│   │   └── Layout.astro
│   ├── pages/            # File-based routing
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── content/          # Content collections
│   │   ├── config.ts
│   │   └── blog/
│   │       ├── post-1.md
│   │       └── post-2.md
│   └── styles/           # Global styles
│       └── global.css
├── public/               # Static assets
├── astro.config.mjs      # Astro config
└── package.json
```

---

## Astro Components

### Basic Component

```astro
---
// Component script (runs at build time)
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!-- Component template -->
<div class="card">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>

<style>
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
</style>
```

### Layout Component

```astro
---
// src/layouts/Layout.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Default description' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <header>
      <nav><!-- Navigation --></nav>
    </header>
    
    <main>
      <slot />
    </main>
    
    <footer>
      <p>&copy; 2024</p>
    </footer>
  </body>
</html>

<style is:global>
  body {
    margin: 0;
    font-family: system-ui, sans-serif;
  }
</style>
```

### Using Layouts

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="Home" description="Welcome to my site">
  <h1>Welcome!</h1>
  <p>This is the home page.</p>
</Layout>
```

---

## Islands Architecture

### Client Directives

```astro
---
// Import framework components
import Counter from '../components/Counter.jsx';
import Carousel from '../components/Carousel.vue';
---

<!-- ✅ Load immediately -->
<Counter client:load />

<!-- ✅ Load when visible (lazy loading) -->
<Carousel client:visible />

<!-- ✅ Load when idle -->
<Widget client:idle />

<!-- ✅ Load only on specific media query -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- ✅ Hydrate only (SSR + hydration) -->
<SearchBar client:only="react" />

<!-- ❌ No client directive = static HTML only -->
<StaticComponent />
```

### Passing Props to Islands

```astro
---
import Counter from '../components/Counter.jsx';

const initialCount = 10;
const config = {
  max: 100,
  step: 5
};
---

<Counter 
  client:load 
  initialCount={initialCount}
  config={config}
/>
```

---

## Content Collections

### Define Collections

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

### Create Content

```markdown
---
# src/content/blog/my-post.md
title: "My First Post"
description: "This is my first blog post"
pubDate: 2024-01-15
author: "John Doe"
tags: ["astro", "web-dev"]
draft: false
---

# My First Post

This is the content of my post...
```

### Query Collections

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

// Get all blog posts
const allPosts = await getCollection('blog');

// Filter published posts
const publishedPosts = allPosts.filter(post => !post.data.draft);

// Sort by date
const sortedPosts = publishedPosts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

<Layout title="Blog">
  <h1>Blog Posts</h1>
  <ul>
    {sortedPosts.map(post => (
      <li>
        <a href={`/blog/${post.slug}`}>
          {post.data.title}
        </a>
        <time>{post.data.pubDate.toLocaleDateString()}</time>
      </li>
    ))}
  </ul>
</Layout>
```

### Dynamic Routes with Collections

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout title={post.data.title} description={post.data.description}>
  <article>
    <h1>{post.data.title}</h1>
    <time>{post.data.pubDate.toLocaleDateString()}</time>
    <Content />
  </article>
</Layout>
```

---

## Routing

### File-Based Routing

```
src/pages/
├── index.astro           → /
├── about.astro           → /about
├── blog/
│   ├── index.astro       → /blog
│   └── [slug].astro      → /blog/:slug
└── products/
    └── [...path].astro   → /products/*
```

### Dynamic Routes

```astro
---
// src/pages/products/[id].astro
export async function getStaticPaths() {
  const products = await fetchProducts();
  
  return products.map(product => ({
    params: { id: product.id },
    props: { product },
  }));
}

const { product } = Astro.props;
---

<h1>{product.name}</h1>
<p>{product.description}</p>
```

### Catch-All Routes

```astro
---
// src/pages/docs/[...path].astro
export async function getStaticPaths() {
  return [
    { params: { path: 'getting-started' } },
    { params: { path: 'guides/installation' } },
    { params: { path: 'api/reference' } },
  ];
}

const { path } = Astro.params;
---

<h1>Docs: {path}</h1>
```

---

## API Routes

```typescript
// src/pages/api/posts.json.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const posts = await fetchPosts();
  
  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  
  // Process data
  
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
```

---

## Styling

### Scoped Styles

```astro
---
const { title } = Astro.props;
---

<div class="card">
  <h2>{title}</h2>
</div>

<style>
  /* Scoped to this component */
  .card {
    padding: 1rem;
    background: white;
  }
  
  h2 {
    color: #333;
  }
</style>
```

### Global Styles

```astro
<style is:global>
  /* Global styles */
  body {
    margin: 0;
    font-family: system-ui;
  }
</style>
```

### CSS Modules

```astro
---
import styles from './Card.module.css';
---

<div class={styles.card}>
  <h2 class={styles.title}>Title</h2>
</div>
```

### Tailwind CSS

```astro
---
// Tailwind classes work out of the box
---

<div class="p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold">Title</h2>
</div>
```

---

## Data Fetching

### At Build Time

```astro
---
// Runs at build time
const response = await fetch('https://api.example.com/data');
const data = await response.json();
---

<ul>
  {data.map(item => (
    <li>{item.name}</li>
  ))}
</ul>
```

### With TypeScript

```astro
---
interface Post {
  id: number;
  title: string;
  body: string;
}

const response = await fetch('https://jsonplaceholder.typicode.com/posts');
const posts: Post[] = await response.json();
---

<ul>
  {posts.slice(0, 10).map(post => (
    <li>{post.title}</li>
  ))}
</ul>
```

---

## Integrations

### Add Framework Support

```bash
# Add React
npx astro add react

# Add Vue
npx astro add vue

# Add Svelte
npx astro add svelte

# Add Tailwind
npx astro add tailwind
```

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static', // or 'server' for SSR
  site: 'https://example.com',
});
```

---

## Performance Optimization

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- ✅ Optimized image -->
<Image 
  src={heroImage} 
  alt="Hero" 
  width={1200}
  height={600}
  loading="lazy"
/>

<!-- ✅ Remote image -->
<Image 
  src="https://example.com/image.jpg"
  alt="Remote"
  width={800}
  height={400}
  inferSize
/>
```

### Prefetching

```astro
---
// Prefetch links for faster navigation
---

<a href="/about" data-astro-prefetch>About</a>
<a href="/blog" data-astro-prefetch="hover">Blog</a>
```

### View Transitions

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

---

## SSR (Server-Side Rendering)

### Enable SSR

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: vercel(), // or netlify(), node(), etc.
});
```

### Server Endpoints

```typescript
// src/pages/api/user.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, request }) => {
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }
  
  const user = await getUserFromSession(sessionId.value);
  
  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

---

## Environment Variables

```javascript
// .env
PUBLIC_API_URL=https://api.example.com
SECRET_KEY=secret123

// Access in .astro files
const apiUrl = import.meta.env.PUBLIC_API_URL;
const secretKey = import.meta.env.SECRET_KEY;
```

---

## Best Practices

```astro
<!-- ✅ Use semantic HTML -->
<article>
  <header>
    <h1>{title}</h1>
  </header>
  <main>
    <slot />
  </main>
</article>

<!-- ✅ Minimize client JavaScript -->
<Counter client:visible />  <!-- Only load when needed -->

<!-- ✅ Use content collections for type safety -->
---
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---

<!-- ✅ Optimize images -->
<Image src={image} alt="Description" width={800} height={600} />

<!-- ✅ Use view transitions for smooth navigation -->
<ViewTransitions />

<!-- ❌ Avoid unnecessary client directives -->
<StaticComponent client:load />  <!-- Don't do this if it's static -->
```

---

## Common Patterns

### Pagination

```astro
---
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection('blog');
  
  return paginate(posts, { pageSize: 10 });
}

const { page } = Astro.props;
---

<ul>
  {page.data.map(post => (
    <li><a href={`/blog/${post.slug}`}>{post.data.title}</a></li>
  ))}
</ul>

{page.url.prev && <a href={page.url.prev}>Previous</a>}
{page.url.next && <a href={page.url.next}>Next</a>}
```

### RSS Feed

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  
  return rss({
    title: 'My Blog',
    description: 'A blog about web development',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
```

---

## Testing

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

// Example test
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    // Test logic
    expect(true).toBe(true);
  });
});
```

---

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [Astro Themes](https://astro.build/themes/)
- [Astro Integrations](https://astro.build/integrations/)
- [Astro Discord](https://astro.build/chat)
