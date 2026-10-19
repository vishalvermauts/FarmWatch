## 2024-03-20 - Responsive Icon Button Accessibility
**Learning:** Buttons that collapse text labels on mobile (`hidden sm:inline`) become completely inaccessible to screen readers if they lack an `aria-label`. The icon alone provides no context.
**Action:** Always add `aria-label` to buttons where the text content is conditionally hidden via CSS breakpoints.
