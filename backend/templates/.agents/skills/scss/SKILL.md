---
name: scss
description: SCSS/Sass best practices, mixins, functions, and modern CSS architecture. Use when working with SCSS/Sass projects.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# SCSS/Sass Development Guide

Modern SCSS/Sass development with best practices, architecture patterns, and reusable components.

## Core Concepts

1. **Variables** - Reusable values for colors, spacing, etc.
2. **Nesting** - Organize styles hierarchically
3. **Mixins** - Reusable style blocks
4. **Functions** - Calculate values dynamically
5. **Partials** - Modular file organization

---

## Installation

```bash
# Install Sass
npm install -D sass

# Or with Dart Sass
npm install -D sass-embedded
```

### Build Scripts

```json
{
  "scripts": {
    "sass": "sass src/styles:dist/css",
    "sass:watch": "sass --watch src/styles:dist/css",
    "sass:prod": "sass src/styles:dist/css --style=compressed"
  }
}
```

---

## Variables

```scss
// ✅ Color variables
$primary-color: #3b82f6;
$secondary-color: #8b5cf6;
$success-color: #10b981;
$error-color: #ef4444;
$warning-color: #f59e0b;

// ✅ Grayscale
$white: #ffffff;
$gray-100: #f3f4f6;
$gray-500: #6b7280;
$gray-900: #111827;
$black: #000000;

// ✅ Spacing
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px

// ✅ Typography
$font-family-sans: 'Inter', system-ui, sans-serif;
$font-family-mono: 'Fira Code', monospace;

$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
$font-size-2xl: 1.5rem;   // 24px
$font-size-3xl: 1.875rem; // 30px
$font-size-4xl: 2.25rem;  // 36px

// ✅ Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// ✅ Z-index
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;

// ✅ Transitions
$transition-base: all 0.3s ease;
$transition-fast: all 0.15s ease;
$transition-slow: all 0.5s ease;

// ✅ Border radius
$border-radius-sm: 0.25rem;
$border-radius-md: 0.5rem;
$border-radius-lg: 0.75rem;
$border-radius-xl: 1rem;
$border-radius-full: 9999px;

// ✅ Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## Nesting

```scss
// ✅ Basic nesting
.card {
  padding: $spacing-lg;
  background: $white;
  border-radius: $border-radius-lg;
  
  &__header {
    margin-bottom: $spacing-md;
    font-size: $font-size-xl;
    font-weight: 600;
  }
  
  &__body {
    color: $gray-500;
    line-height: 1.6;
  }
  
  &__footer {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $gray-100;
  }
  
  // ✅ Pseudo-classes
  &:hover {
    box-shadow: $shadow-lg;
  }
  
  // ✅ Modifiers
  &--featured {
    border: 2px solid $primary-color;
  }
  
  &--compact {
    padding: $spacing-md;
  }
}

// ❌ Avoid deep nesting (max 3 levels)
.bad {
  .level-1 {
    .level-2 {
      .level-3 {
        .level-4 {  // Too deep!
          color: red;
        }
      }
    }
  }
}
```

---

## Mixins

```scss
// ✅ Responsive breakpoint mixin
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: $breakpoint-sm) { @content; }
  }
  @else if $breakpoint == 'md' {
    @media (min-width: $breakpoint-md) { @content; }
  }
  @else if $breakpoint == 'lg' {
    @media (min-width: $breakpoint-lg) { @content; }
  }
  @else if $breakpoint == 'xl' {
    @media (min-width: $breakpoint-xl) { @content; }
  }
}

// Usage
.container {
  padding: $spacing-md;
  
  @include respond-to('md') {
    padding: $spacing-lg;
  }
  
  @include respond-to('lg') {
    padding: $spacing-xl;
  }
}

// ✅ Flexbox center mixin
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ Truncate text mixin
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ✅ Line clamp mixin
@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ✅ Button mixin
@mixin button($bg-color, $text-color: $white) {
  padding: $spacing-sm $spacing-lg;
  background-color: $bg-color;
  color: $text-color;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-base;
  
  &:hover {
    background-color: darken($bg-color, 10%);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Usage
.btn-primary {
  @include button($primary-color);
}

.btn-secondary {
  @include button($secondary-color);
}

// ✅ Card mixin
@mixin card($padding: $spacing-lg) {
  padding: $padding;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  transition: $transition-base;
  
  &:hover {
    box-shadow: $shadow-xl;
  }
}

// ✅ Aspect ratio mixin
@mixin aspect-ratio($width, $height) {
  position: relative;
  
  &::before {
    content: '';
    display: block;
    padding-top: ($height / $width) * 100%;
  }
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
```

---

## Functions

```scss
// ✅ Convert px to rem
@function rem($pixels, $base: 16) {
  @return ($pixels / $base) * 1rem;
}

// Usage
.text {
  font-size: rem(18); // 1.125rem
  margin-bottom: rem(24); // 1.5rem
}

// ✅ Lighten/darken colors
@function tint($color, $percentage) {
  @return mix(white, $color, $percentage);
}

@function shade($color, $percentage) {
  @return mix(black, $color, $percentage);
}

// Usage
.button {
  background: $primary-color;
  
  &:hover {
    background: shade($primary-color, 10%);
  }
}

// ✅ Get spacing value
@function spacing($multiplier) {
  @return $spacing-md * $multiplier;
}

// Usage
.container {
  padding: spacing(2); // 2rem
  margin-bottom: spacing(3); // 3rem
}

// ✅ Strip unit
@function strip-unit($number) {
  @if type-of($number) == 'number' and not unitless($number) {
    @return $number / ($number * 0 + 1);
  }
  @return $number;
}
```

---

## Partials & Architecture

```
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _placeholders.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _utilities.scss
├── components/
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _forms.scss
│   └── _modals.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   └── _grid.scss
├── pages/
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
└── main.scss
```

### Main SCSS File

```scss
// main.scss

// ✅ Abstracts (no CSS output)
@import 'abstracts/variables';
@import 'abstracts/mixins';
@import 'abstracts/functions';

// ✅ Base
@import 'base/reset';
@import 'base/typography';
@import 'base/utilities';

// ✅ Layout
@import 'layout/header';
@import 'layout/footer';
@import 'layout/grid';

// ✅ Components
@import 'components/buttons';
@import 'components/cards';
@import 'components/forms';

// ✅ Pages
@import 'pages/home';
@import 'pages/about';
```

---

## Placeholders (Extend)

```scss
// ✅ Define placeholder
%button-base {
  padding: $spacing-sm $spacing-lg;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-base;
}

// ✅ Extend placeholder
.btn-primary {
  @extend %button-base;
  background: $primary-color;
  color: $white;
}

.btn-secondary {
  @extend %button-base;
  background: $secondary-color;
  color: $white;
}

// ✅ Clearfix placeholder
%clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

.container {
  @extend %clearfix;
}
```

---

## Maps & Loops

```scss
// ✅ Color map
$colors: (
  'primary': $primary-color,
  'secondary': $secondary-color,
  'success': $success-color,
  'error': $error-color,
  'warning': $warning-color
);

// ✅ Generate utility classes
@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
  
  .bg-#{$name} {
    background-color: $color;
  }
  
  .border-#{$name} {
    border-color: $color;
  }
}

// ✅ Spacing map
$spacings: (
  'xs': $spacing-xs,
  'sm': $spacing-sm,
  'md': $spacing-md,
  'lg': $spacing-lg,
  'xl': $spacing-xl
);

@each $name, $value in $spacings {
  .p-#{$name} { padding: $value; }
  .pt-#{$name} { padding-top: $value; }
  .pr-#{$name} { padding-right: $value; }
  .pb-#{$name} { padding-bottom: $value; }
  .pl-#{$name} { padding-left: $value; }
  
  .m-#{$name} { margin: $value; }
  .mt-#{$name} { margin-top: $value; }
  .mr-#{$name} { margin-right: $value; }
  .mb-#{$name} { margin-bottom: $value; }
  .ml-#{$name} { margin-left: $value; }
}

// ✅ Grid columns
@for $i from 1 through 12 {
  .col-#{$i} {
    width: percentage($i / 12);
  }
}
```

---

## BEM Methodology

```scss
// ✅ Block Element Modifier
.card {
  // Block
  padding: $spacing-lg;
  background: $white;
  border-radius: $border-radius-lg;
  
  // Elements
  &__header {
    margin-bottom: $spacing-md;
    font-size: $font-size-xl;
  }
  
  &__body {
    color: $gray-500;
  }
  
  &__footer {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $gray-100;
  }
  
  // Modifiers
  &--featured {
    border: 2px solid $primary-color;
  }
  
  &--large {
    padding: $spacing-xl;
  }
  
  &--compact {
    padding: $spacing-md;
  }
}

// HTML Usage:
// <div class="card card--featured">
//   <div class="card__header">Title</div>
//   <div class="card__body">Content</div>
//   <div class="card__footer">Footer</div>
// </div>
```

---

## Best Practices

```scss
// ✅ Use variables for repeated values
$primary-color: #3b82f6;

.button {
  background: $primary-color;
}

// ✅ Organize with partials
@import 'variables';
@import 'mixins';
@import 'components/buttons';

// ✅ Use mixins for reusable patterns
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ Avoid deep nesting (max 3 levels)
.parent {
  .child {
    .grandchild {
      // Stop here
    }
  }
}

// ✅ Use & for parent selector
.button {
  &:hover { }
  &:active { }
  &--primary { }
}

// ✅ Use placeholder selectors for extends
%button-base {
  padding: 10px 20px;
}

.btn {
  @extend %button-base;
}

// ❌ Avoid @import in favor of @use (Sass modules)
// Old way
@import 'variables';

// ✅ New way (Sass modules)
@use 'variables' as *;
@use 'mixins' as mix;

.button {
  background: $primary-color;
  @include mix.flex-center;
}
```

---

## Modern Sass Modules

```scss
// _variables.scss
$primary-color: #3b82f6;
$secondary-color: #8b5cf6;

// _mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// main.scss
@use 'variables' as *;
@use 'mixins' as mix;

.container {
  background: $primary-color;
  @include mix.flex-center;
}

// ✅ With namespace
@use 'variables' as vars;

.button {
  background: vars.$primary-color;
}

// ✅ Forward partials
// _index.scss
@forward 'variables';
@forward 'mixins';
@forward 'functions';

// main.scss
@use 'abstracts' as *;
```

---

## Resources

- [Sass Documentation](https://sass-lang.com/documentation)
- [Sass Guidelines](https://sass-guidelin.es/)
- [BEM Methodology](http://getbem.com/)
- [SCSS Lint](https://github.com/sds/scss-lint)
