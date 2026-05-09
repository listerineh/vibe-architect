---
name: motion-performance-skill
description: Optimization of animations, scroll behaviors, and asset loading. Enforces 60fps, reduces Main Thread work, and ensures smooth transitions using Framer Motion and CSS hardware acceleration.
---

# Motion & Performance Skill

Goal: Make the interface feel "weightless" and high-performance.

## Interaction Principles
- **Hardware Acceleration:** Use `transform` (translate, scale, rotate) and `opacity` for animations. Avoid animating `top`, `left`, or `height`.
- **Staggered Reveals:** Elements should not pop in all at once. Use 0.05s delays between list items or grid elements.
- **Micro-haptics:** Subtle scale changes (0.98 or 1.02) on clicks or hovers to give physical feedback.
- **Scroll Physics:** Implement "smooth scroll" or `scroll-snap` only if it improves the reading rhythm.

## Optimization Rules
- **Lazy Hydration:** If a 3D scene or heavy component is far down the page, don't initialize it until it's near the viewport.
- **Reduced Motion:** Respect `prefers-reduced-motion` media queries.
- **Adaptive Quality:** If the device is struggling (low FPS), simplify the Three.js particle count or disable post-processing.
- **Asset Loading:** Use Next.js `Image` component with `priority` for the first fold and `loading="lazy"` for the rest.

## Litmus Checks
- Is the Lighthouse Performance score > 90?
- Are transitions smooth on a mid-range mobile device?
- Does the 3D canvas pause when not visible?
