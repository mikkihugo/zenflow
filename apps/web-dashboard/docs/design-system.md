# Claude Code Zen Web Dashboard Design System

## Overview

This design system defines the standards, principles, and reusable components for the Claude Code Zen web dashboard. It ensures consistency, accessibility, and enterprise-grade quality across all user interfaces.

---

## Principles

- **Accessibility:** All components must meet WCAG 2.1 AA standards. Use semantic HTML, ARIA attributes, and keyboard navigation.
- **Responsive Design:** Components adapt to mobile, tablet, and desktop. Use fluid layouts and media queries.
- **Performance:** Optimize for fast load times and smooth interactions. Minimize bundle size and use progressive loading.
- **Consistency:** Follow unified styles, spacing, and interaction patterns. Use Tailwind CSS for utility-first styling.
- **Enterprise Compliance:** Preserve error handling, telemetry, and event-driven architecture.

---

## Component Standards

### Structure

- Use React or Svelte components with clear props and state management.
- Prefer composition over inheritance.
- All components must include accessibility features by default.

### Example: Accessible Button

```tsx
// AccessibleButton.tsx
import React from 'react';

export function AccessibleButton({ children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      className="px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={props['aria-label'] || 'Button'}
    >
      {children}
    </button>
  );
}
```

---

## Accessibility Guidelines

- Use `aria-live` regions for error and status messages.
- Ensure all interactive elements are reachable via keyboard.
- Provide visible focus indicators.
- Use descriptive labels for form fields and controls.
- Test with screen readers and keyboard-only navigation.

---

## Responsive Design

- Use Tailwind CSS breakpoints (`sm`, `md`, `lg`, `xl`) for layout adjustments.
- Avoid fixed pixel values; prefer relative units (`rem`, `%`).
- Test components on multiple devices and screen sizes.

---

## Usage Patterns

### Error Boundary Example

See [`src/lib/components/ErrorBoundary.ts`](src/lib/components/ErrorBoundary.ts) for the enterprise error boundary implementation, including ARIA live regions and focus management.

### Component Import Example

```tsx
import { AccessibleButton } from '../components/AccessibleButton';

<AccessibleButton aria-label="Submit Form">Submit</AccessibleButton>
```

---

## Testing

- All components must have unit tests in the `tests/` directory.
- Use Vitest for test coverage.
- Do not place tests in `src/` or `__tests__/` directories.

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility](https://react.dev/reference/react-dom/components/button#accessibility)
- [Claude Code Zen Architecture](../README.md)

---

## Contribution

- Follow code review and TaskMaster approval workflows for major changes.
- Document all new components and patterns in this file.
- Validate accessibility and responsive behavior before merging.
