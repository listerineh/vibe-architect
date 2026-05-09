---
name: tailwind
description: Tailwind CSS utility-first framework best practices, responsive design, and optimization. Use when working with Tailwind CSS projects.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# Tailwind CSS Development Guide

Modern Tailwind CSS development with utility-first approach, responsive design, and performance optimization.

## Core Concepts

1. **Utility-First** - Build designs using utility classes
2. **Responsive** - Mobile-first responsive design
3. **Customizable** - Extend with custom utilities and components
4. **Performance** - Purge unused CSS in production

---

## Installation & Setup

```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

### Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
        secondary: '#8b5cf6',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### CSS Entry Point

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  h1 {
    @apply text-4xl font-bold;
  }
  
  h2 {
    @apply text-3xl font-semibold;
  }
}

/* Custom components */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition;
  }
  
  .card {
    @apply p-6 bg-white rounded-lg shadow-md;
  }
}

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## Layout

### Container & Spacing

```html
<!-- ✅ Container with responsive padding -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <!-- Content -->
  </div>
</div>

<!-- ✅ Flexbox layout -->
<div class="flex items-center justify-between gap-4">
  <div class="flex-1">Left</div>
  <div class="flex-shrink-0">Right</div>
</div>

<!-- ✅ Grid layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="col-span-1">Item 1</div>
  <div class="col-span-1">Item 2</div>
  <div class="col-span-1">Item 3</div>
</div>

<!-- ✅ Responsive grid -->
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
  <!-- Items -->
</div>
```

### Positioning

```html
<!-- ✅ Absolute positioning -->
<div class="relative">
  <div class="absolute top-0 right-0 m-4">
    Badge
  </div>
</div>

<!-- ✅ Sticky header -->
<header class="sticky top-0 z-50 bg-white shadow">
  Navigation
</header>

<!-- ✅ Fixed footer -->
<footer class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white">
  Footer
</footer>

<!-- ✅ Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div class="text-center">Centered</div>
</div>
```

---

## Typography

```html
<!-- ✅ Text sizes (responsive) -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

<!-- ✅ Font weights -->
<p class="font-light">Light</p>
<p class="font-normal">Normal</p>
<p class="font-medium">Medium</p>
<p class="font-semibold">Semibold</p>
<p class="font-bold">Bold</p>

<!-- ✅ Text colors -->
<p class="text-gray-900 dark:text-gray-100">
  Text with dark mode
</p>

<!-- ✅ Line height & letter spacing -->
<p class="leading-relaxed tracking-wide">
  Comfortable reading text
</p>

<!-- ✅ Text truncation -->
<p class="truncate">
  This text will be truncated with ellipsis...
</p>

<p class="line-clamp-3">
  This text will be clamped to 3 lines...
</p>
```

---

## Colors & Backgrounds

```html
<!-- ✅ Background colors -->
<div class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
  Button
</div>

<!-- ✅ Gradients -->
<div class="bg-gradient-to-r from-purple-500 to-pink-500">
  Gradient background
</div>

<div class="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
  Multi-color gradient
</div>

<!-- ✅ Opacity -->
<div class="bg-black bg-opacity-50">
  Semi-transparent overlay
</div>

<!-- ✅ Background images -->
<div class="bg-cover bg-center bg-no-repeat" 
     style="background-image: url('/hero.jpg')">
  Hero section
</div>
```

---

## Borders & Shadows

```html
<!-- ✅ Borders -->
<div class="border border-gray-300 rounded-lg">
  Card with border
</div>

<div class="border-2 border-blue-500 rounded-full">
  Circular border
</div>

<!-- ✅ Border radius -->
<div class="rounded-none">No radius</div>
<div class="rounded-sm">Small</div>
<div class="rounded-md">Medium</div>
<div class="rounded-lg">Large</div>
<div class="rounded-xl">Extra large</div>
<div class="rounded-full">Full (circle)</div>

<!-- ✅ Shadows -->
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">2XL shadow</div>

<!-- ✅ Hover shadows -->
<div class="shadow-md hover:shadow-xl transition-shadow">
  Hover for shadow
</div>
```

---

## Responsive Design

```html
<!-- ✅ Responsive utilities -->
<div class="
  w-full           /* Mobile: full width */
  sm:w-1/2         /* Small: 50% */
  md:w-1/3         /* Medium: 33% */
  lg:w-1/4         /* Large: 25% */
  xl:w-1/6         /* XL: 16.6% */
">
  Responsive width
</div>

<!-- ✅ Hide/show on breakpoints -->
<div class="hidden md:block">
  Visible on medium screens and up
</div>

<div class="block md:hidden">
  Visible only on mobile
</div>

<!-- ✅ Responsive text alignment -->
<p class="text-left sm:text-center lg:text-right">
  Responsive alignment
</p>

<!-- ✅ Responsive padding -->
<div class="p-4 sm:p-6 md:p-8 lg:p-12">
  Responsive padding
</div>
```

### Breakpoints

```
sm: 640px   @media (min-width: 640px)
md: 768px   @media (min-width: 768px)
lg: 1024px  @media (min-width: 1024px)
xl: 1280px  @media (min-width: 1280px)
2xl: 1536px @media (min-width: 1536px)
```

---

## Interactive States

```html
<!-- ✅ Hover states -->
<button class="bg-blue-500 hover:bg-blue-600 hover:scale-105 transition">
  Hover me
</button>

<!-- ✅ Focus states -->
<input class="
  border border-gray-300 
  focus:border-blue-500 
  focus:ring-2 
  focus:ring-blue-200 
  focus:outline-none
  rounded-lg px-4 py-2
" />

<!-- ✅ Active states -->
<button class="bg-blue-500 active:bg-blue-700 active:scale-95">
  Click me
</button>

<!-- ✅ Disabled states -->
<button class="
  bg-blue-500 
  disabled:bg-gray-300 
  disabled:cursor-not-allowed
  disabled:opacity-50
" disabled>
  Disabled
</button>

<!-- ✅ Group hover -->
<div class="group">
  <img class="group-hover:scale-110 transition" src="image.jpg" />
  <p class="group-hover:text-blue-500">Hover parent</p>
</div>
```

---

## Transitions & Animations

```html
<!-- ✅ Transitions -->
<div class="
  transition-all 
  duration-300 
  ease-in-out
  hover:scale-110
">
  Smooth transition
</div>

<!-- ✅ Transform -->
<div class="
  transform 
  hover:rotate-6 
  hover:scale-110 
  transition
">
  Transform on hover
</div>

<!-- ✅ Custom animations -->
<div class="animate-spin">Spinning</div>
<div class="animate-ping">Pinging</div>
<div class="animate-pulse">Pulsing</div>
<div class="animate-bounce">Bouncing</div>

<!-- ✅ Transition properties -->
<div class="transition-colors duration-200">Color transition</div>
<div class="transition-transform duration-300">Transform transition</div>
<div class="transition-opacity duration-500">Opacity transition</div>
```

---

## Dark Mode

```html
<!-- ✅ Dark mode classes -->
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">
    Title
  </h1>
  <p class="text-gray-600 dark:text-gray-300">
    Description
  </p>
</div>

<!-- ✅ Dark mode configuration -->
```

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}
```

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

---

## Components

### Button

```html
<!-- ✅ Primary button -->
<button class="
  px-6 py-3
  bg-blue-500 hover:bg-blue-600
  text-white font-semibold
  rounded-lg
  shadow-md hover:shadow-lg
  transition-all
  active:scale-95
">
  Primary Button
</button>

<!-- ✅ Outline button -->
<button class="
  px-6 py-3
  border-2 border-blue-500
  text-blue-500 hover:bg-blue-500 hover:text-white
  font-semibold rounded-lg
  transition-all
">
  Outline Button
</button>
```

### Card

```html
<div class="
  bg-white dark:bg-gray-800
  rounded-xl
  shadow-lg hover:shadow-xl
  overflow-hidden
  transition-shadow
">
  <img class="w-full h-48 object-cover" src="image.jpg" alt="Card" />
  <div class="p-6">
    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">
      Card Title
    </h3>
    <p class="text-gray-600 dark:text-gray-300 mb-4">
      Card description goes here.
    </p>
    <button class="
      w-full px-4 py-2
      bg-blue-500 hover:bg-blue-600
      text-white rounded-lg
      transition
    ">
      Action
    </button>
  </div>
</div>
```

### Input

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Email
  </label>
  <input 
    type="email"
    class="
      w-full px-4 py-2
      border border-gray-300 dark:border-gray-600
      rounded-lg
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition
    "
    placeholder="Enter your email"
  />
</div>
```

### Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black bg-opacity-50"></div>
  
  <!-- Modal -->
  <div class="
    relative z-10
    bg-white dark:bg-gray-800
    rounded-xl
    shadow-2xl
    max-w-md w-full mx-4
    p-6
  ">
    <h2 class="text-2xl font-bold mb-4">Modal Title</h2>
    <p class="text-gray-600 dark:text-gray-300 mb-6">
      Modal content goes here.
    </p>
    <div class="flex gap-4">
      <button class="flex-1 px-4 py-2 bg-gray-200 rounded-lg">
        Cancel
      </button>
      <button class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## Best Practices

```html
<!-- ✅ Use semantic HTML -->
<article class="prose lg:prose-xl">
  <h1>Article Title</h1>
  <p>Content...</p>
</article>

<!-- ✅ Group related utilities -->
<div class="
  /* Layout */
  flex items-center justify-between
  /* Spacing */
  px-4 py-2 gap-4
  /* Colors */
  bg-white text-gray-900
  /* Effects */
  rounded-lg shadow-md
">
  Content
</div>

<!-- ✅ Extract components with @apply -->
```

```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-semibold transition;
  }
  
  .btn-primary {
    @apply btn bg-blue-500 text-white hover:bg-blue-600;
  }
}
```

```html
<!-- ✅ Use the component -->
<button class="btn-primary">Click me</button>

<!-- ❌ Avoid inline styles -->
<div style="color: red;">Bad</div>

<!-- ✅ Use Tailwind classes -->
<div class="text-red-500">Good</div>

<!-- ✅ Use arbitrary values when needed -->
<div class="top-[117px]">Custom value</div>
<div class="bg-[#1da1f2]">Custom color</div>
```

---

## Performance

```javascript
// tailwind.config.js
module.exports = {
  // ✅ Specify content paths for purging
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  
  // ✅ Safelist dynamic classes
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
  ],
  
  // ✅ Use JIT mode (default in v3)
  mode: 'jit',
}
```

---

## Plugins

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    // ✅ Forms plugin
    require('@tailwindcss/forms'),
    
    // ✅ Typography plugin
    require('@tailwindcss/typography'),
    
    // ✅ Aspect ratio plugin
    require('@tailwindcss/aspect-ratio'),
    
    // ✅ Line clamp plugin
    require('@tailwindcss/line-clamp'),
    
    // ✅ Custom plugin
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        },
      })
    },
  ],
}
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)
- [Tailwind Play](https://play.tailwindcss.com/)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
