---
name: nextjs
description: Next.js App Router best practices, SSR/SSG patterns, routing, and optimization. Use when working with Next.js applications, server components, or Next.js-specific features.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# Next.js Development Guide

Modern Next.js 14+ development with App Router, Server Components, and performance optimization.

## Core Concepts

1. **App Router** - File-system based routing with layouts
2. **Server Components** - Default server-side rendering
3. **Streaming** - Progressive rendering with Suspense
4. **Data Fetching** - Server-side data loading patterns

---

## App Router Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── (auth)/             # Route group
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx      # Nested layout
│   ├── page.tsx
│   └── [id]/           # Dynamic route
│       └── page.tsx
└── api/                # API routes
    └── users/
        └── route.ts
```

---

## Server vs Client Components

### Server Components (Default)

```tsx
// ✅ Server Component - no 'use client'
async function UserProfile({ userId }: { userId: string }) {
  // Fetch directly in component
  const user = await db.user.findUnique({ where: { id: userId } });
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ✅ Benefits:
// - Direct database access
// - No client bundle size
// - Automatic code splitting
// - SEO friendly
```

### Client Components

```tsx
'use client';

// ✅ Use client components for:
// - Interactivity (onClick, onChange)
// - Hooks (useState, useEffect)
// - Browser APIs (localStorage, window)
// - Event listeners

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Composition Pattern

```tsx
// ✅ Keep client components small
// layout.tsx (Server Component)
import { ClientSidebar } from './client-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ClientSidebar />
      {children} {/* Server Component */}
    </div>
  );
}

// client-sidebar.tsx (Client Component)
'use client';

export function ClientSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return <aside>{/* interactive sidebar */}</aside>;
}
```

---

## Data Fetching

### Server-Side Fetching

```tsx
// ✅ Fetch in Server Components
async function Posts() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache', // Static (default)
  });
  
  return <PostList posts={posts} />;
}

// ✅ Revalidate cache
async function Posts() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  return <PostList posts={posts} />;
}

// ✅ No caching (dynamic)
async function Posts() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  });
  
  return <PostList posts={posts} />;
}
```

### Parallel Data Fetching

```tsx
// ✅ Fetch in parallel
async function Page() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  
  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
    </div>
  );
}
```

### Sequential Data Fetching

```tsx
// ✅ When data depends on previous fetch
async function Page({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);
  const posts = await fetchUserPosts(user.id); // Depends on user
  
  return <div>{/* ... */}</div>;
}
```

---

## Loading & Streaming

### Loading UI

```tsx
// loading.tsx - Automatic loading state
export default function Loading() {
  return <Skeleton />;
}

// ✅ Instant loading state while page loads
```

### Suspense Boundaries

```tsx
// ✅ Granular loading states
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
    </div>
  );
}
```

---

## Error Handling

### Error Boundaries

```tsx
// error.tsx - Automatic error boundary
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found

```tsx
// not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <Link href="/">Go home</Link>
    </div>
  );
}

// Trigger from page
import { notFound } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);
  
  if (!user) {
    notFound(); // Shows not-found.tsx
  }
  
  return <div>{user.name}</div>;
}
```

---

## Routing

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export default function Post({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await fetchPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### Catch-all Routes

```tsx
// app/docs/[...slug]/page.tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  // /docs/a/b/c -> params.slug = ['a', 'b', 'c']
  return <div>{params.slug.join('/')}</div>;
}
```

### Route Groups

```tsx
// (marketing)/about/page.tsx
// (marketing)/contact/page.tsx
// (app)/dashboard/page.tsx
// (app)/settings/page.tsx

// Groups don't affect URL structure
// /about, /contact, /dashboard, /settings
```

### Parallel Routes

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  );
}

// app/@team/page.tsx
// app/@analytics/page.tsx
```

---

## API Routes

### Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Dynamic API Routes

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  });
  
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}
```

---

## Metadata & SEO

### Static Metadata

```tsx
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our site',
  openGraph: {
    title: 'Home',
    description: 'Welcome to our site',
    images: ['/og-image.jpg'],
  },
};
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

---

## Server Actions

```tsx
// ✅ Server Actions for mutations
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  await db.post.create({
    data: { title, content }
  });
  
  revalidatePath('/posts');
  redirect('/posts');
}

// Use in Client Component
'use client';

import { createPost } from './actions';

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image';

// ✅ Automatic optimization
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately
/>

// ✅ Lazy loading (default)
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  loading="lazy"
/>
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Script Optimization

```tsx
import Script from 'next/script';

// ✅ Control script loading
<Script
  src="https://example.com/script.js"
  strategy="lazyOnload" // or 'afterInteractive', 'beforeInteractive'
/>
```

---

## Caching Strategies

```tsx
// ✅ Static Generation (default)
export const dynamic = 'force-static';

// ✅ Server-Side Rendering
export const dynamic = 'force-dynamic';

// ✅ Incremental Static Regeneration
export const revalidate = 3600; // Revalidate every hour

// ✅ Dynamic with cache
export const fetchCache = 'default-cache';
```

---

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://api.example.com"
```

```tsx
// ✅ Server-side only
const dbUrl = process.env.DATABASE_URL;

// ✅ Client-side (must start with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Common Patterns

### Protected Routes

```tsx
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>{children}</div>;
}
```

### Data Mutations

```tsx
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateUser(userId: string, data: UserData) {
  await db.user.update({
    where: { id: userId },
    data,
  });
  
  // Revalidate specific path
  revalidatePath(`/users/${userId}`);
  
  // Or revalidate by tag
  revalidateTag('users');
}
```

---

## Testing

```tsx
// ✅ Test Server Components
import { render, screen } from '@testing-library/react';
import Page from './page';

test('renders page', async () => {
  render(await Page());
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

// ✅ Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
  })
) as jest.Mock;
```

---

## Common Pitfalls

### ❌ Avoid

```tsx
// Using client-side hooks in Server Components
export default function Page() {
  const [state, setState] = useState(0); // Error!
  return <div>{state}</div>;
}

// Fetching in Client Components without SWR/React Query
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <div>{data}</div>;
}

// Not using Suspense for async components
export default function Page() {
  return <AsyncComponent />; // No loading state!
}
```

### ✅ Do Instead

```tsx
// Move state to Client Component
'use client';
export default function Page() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// Fetch in Server Component
export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json());
  return <div>{data}</div>;
}

// Wrap with Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Vercel Deployment](https://vercel.com/docs)
