import type { ChallengeCategory } from "./types";

/** Canonical display order of challenge categories. */
export const CATEGORY_ORDER: ChallengeCategory[] = [
  // Foundations
  "media-queries",
  "container-queries",
  "fluid-typography",
  "viewport-units",
  // Layout Patterns
  "flexbox-patterns",
  "grid-patterns",
  "responsive-spacing",
  "overflow-handling",
  // Component Patterns
  "breakpoint-hooks",
  "responsive-props",
  "conditional-rendering",
  "responsive-images",
  // Framework Patterns
  "mui-responsive",
  "tailwind-responsive",
  // Anti-Patterns & Debugging
  "common-mistakes",
  "testing-responsive",
];

/** Human-readable labels for each challenge category. */
export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  "media-queries": "Media Queries",
  "container-queries": "Container Queries",
  "fluid-typography": "Fluid Typography",
  "viewport-units": "Viewport Units",
  "flexbox-patterns": "Flexbox Patterns",
  "grid-patterns": "Grid Patterns",
  "responsive-spacing": "Responsive Spacing",
  "overflow-handling": "Overflow Handling",
  "breakpoint-hooks": "Breakpoint Hooks",
  "responsive-props": "Responsive Props",
  "conditional-rendering": "Conditional Rendering",
  "responsive-images": "Responsive Images",
  "mui-responsive": "MUI Responsive",
  "tailwind-responsive": "Tailwind Responsive",
  "common-mistakes": "Common Mistakes",
  "testing-responsive": "Testing Responsive",
};

/** Logical grouping of categories for sidebar navigation. */
export interface CategorySection {
  label: string;
  categories: ChallengeCategory[];
}

export const CATEGORY_SECTIONS: CategorySection[] = [
  {
    label: "Foundations",
    categories: [
      "media-queries",
      "container-queries",
      "fluid-typography",
      "viewport-units",
    ],
  },
  {
    label: "Layout Patterns",
    categories: [
      "flexbox-patterns",
      "grid-patterns",
      "responsive-spacing",
      "overflow-handling",
    ],
  },
  {
    label: "Component Patterns",
    categories: [
      "breakpoint-hooks",
      "responsive-props",
      "conditional-rendering",
      "responsive-images",
    ],
  },
  {
    label: "Framework Patterns",
    categories: ["mui-responsive", "tailwind-responsive"],
  },
  {
    label: "Anti-Patterns & Debugging",
    categories: ["common-mistakes", "testing-responsive"],
  },
];

/** Short description for each category, shown on the learn overview. */
export const CATEGORY_DESCRIPTIONS: Record<ChallengeCategory, string> = {
  "media-queries":
    "Mobile-first breakpoints, logical ranges with min-width, and why max-width leads to override chains.",
  "container-queries":
    "@container vs @media: when components should own their own responsiveness instead of relying on the viewport.",
  "fluid-typography":
    "Using clamp() and fluid type scales so text adapts smoothly without hard breakpoints.",
  "viewport-units":
    "vw, vh, dvh, svh, and lvh. Understanding the mobile viewport trap and picking the right unit.",
  "flexbox-patterns":
    "flex-wrap, gap, shrink, and grow for layouts that reflow naturally across screen sizes.",
  "grid-patterns":
    "auto-fit, auto-fill, and minmax() for responsive grids that need zero media queries.",
  "responsive-spacing":
    "Consistent spacing systems that scale with the viewport using clamp(), custom properties, and theme tokens.",
  "overflow-handling":
    "Scroll containers, text truncation, responsive tables, and preventing horizontal overflow on mobile.",
  "breakpoint-hooks":
    "useMediaQuery, custom breakpoint hooks, SSR hydration pitfalls, and when to avoid them entirely.",
  "responsive-props":
    "Components that accept breakpoint-aware prop objects like direction={{ xs: 'column', md: 'row' }}.",
  "conditional-rendering":
    "Rendering different components by viewport vs hiding with CSS, including performance and SEO tradeoffs.",
  "responsive-images":
    "srcSet, sizes, next/image, art direction with <picture>, and avoiding layout shift.",
  "mui-responsive":
    "MUI's sx breakpoint syntax, responsive Grid2, theme.breakpoints, and responsive dialog patterns.",
  "tailwind-responsive":
    "Utility-first responsive design with sm:/md:/lg: prefixes, container queries plugin, and custom screens.",
  "common-mistakes":
    "Fixed widths, pixel assumptions, forgotten touch targets, ignoring landscape, and other responsive pitfalls.",
  "testing-responsive":
    "Strategies for testing responsiveness: viewport meta, device mode, visual regression, and automated checks.",
};
