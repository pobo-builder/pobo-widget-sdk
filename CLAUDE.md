# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**pobo-widget-sdk** is a SCSS widget library for Pobo Page Builder. It provides styled UI components (widgets) for e-commerce product pages.

## Project Structure

```
src/
├── generic/           # BEM components with CSS variables (modern)
│   ├── rc-*.scss      # Widget components (e.g., rc-gallery-one.scss)
│   ├── part/          # Shared partial styles
│   └── plugin/        # Plugin styles (gallery, carousel)
├── utils/             # Utilities and helpers
│   ├── native-variable.scss  # CSS custom properties definitions
│   ├── grid.scss      # Grid system
│   └── spacing.scss   # Spacing utilities
├── custom/            # Client-specific customizations
├── *.scss             # Legacy components (hardcoded values)
├── editor.scss        # Legacy entry point (imports legacy components)
└── generic.scss       # BEM entry point (imports generic/ components)

generic.html           # HTML examples for BEM components
index.html             # HTML examples for legacy components
```

## Two Component Systems

### 1. BEM System (Modern) - `src/generic/`
- Uses CSS custom properties (variables) with `--pobo-*` prefix
- Class names: `.rc-component-name`
- Registered in: `src/generic.scss`
- Preview in: `generic.html`

### 2. Legacy System - `src/`
- Uses hardcoded values
- Same class names as BEM versions
- Registered in: `src/editor.scss`
- Preview in: `index.html`

## BEM Naming Conventions

### Class Structure
```
.rc-component-name           # Block
.rc-component-name__element  # Element
.rc-component-name--modifier # Modifier
```

### Image Element Naming

**Pattern 1: `__[parent]-img`** - When img is direct child of a named element:
```scss
&__left {
  // container
}
&__left-img {
  // img inside __left
}
```

Examples: `__photo-img`, `__ico-img`, `__wrap-img`, `__left-img`, `__right-img`

**Pattern 2: `__img`** - When img is inside a generic container:
```scss
&__image {
  // container
}
&__img {
  // img inside __image
}
```

### CSS Variable Naming
```
--pobo-[component]-[element]-[property]
```

Examples:
```scss
--pobo-gallery-one-img-height: 500px;
--pobo-gallery-one-img-object-fit: cover;
--pobo-gallery-one-image-border-radius: 0;
```

## Creating New Components

### 1. Create BEM version in `src/generic/`
```scss
// src/generic/rc-component-name.scss
.rc-component-name {
  width: 100%;
  padding: var(--pobo-component-name-padding);
  // ... use CSS variables

  &__element {
    // ...
  }
}
```

### 2. Create Legacy version in `src/`
```scss
// src/component-name.scss
.rc-component-name {
  width: 100%;
  padding: 0;
  // ... use hardcoded values

  &__element {
    // ...
  }
}
```

### 3. Add CSS variables to `src/utils/native-variable.scss`
```scss
// Component Name
--pobo-component-name-padding: 0;
--pobo-component-name-bg: transparent;
// ...
```

### 4. Register components
- BEM: Add `@import "generic/rc-component-name";` to `src/generic.scss`
- Legacy: Add `@import "component-name";` to `src/editor.scss`

### 5. Add HTML examples to `generic.html`

## Responsive Breakpoints

Uses Bootstrap 4 breakpoint mixins:
```scss
@include media-breakpoint-down(sm) { }  // < 576px
@include media-breakpoint-down(md) { }  // < 768px
@include media-breakpoint-down(lg) { }  // < 992px
```

## Layout Patterns

### Flexbox with calc() (preferred)
```scss
.rc-gallery-two {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pobo-gallery-two-gap);

  &__image {
    width: calc(100% / 2 - var(--pobo-gallery-two-gap) / 2);

    @include media-breakpoint-down(sm) {
      width: 100%;
    }
  }
}
```

### Column calculations
- 2 columns: `calc(100% / 2 - var(--gap) / 2)`
- 3 columns: `calc(100% / 3 - var(--gap) * 2 / 3)`
- 4 columns: `calc(100% / 4 - var(--gap) * 3 / 4)`

## Development Commands

```bash
npm run watch:generic   # Dev server for BEM components (port 8086)
npm run watch:standalone # Dev server for legacy (port 8088)
npm run build           # Build for production
```

## Common Component Types

- **Gallery**: `rc-gallery-one`, `rc-gallery-two`, `rc-gallery-three`, `rc-gallery-four`, `rc-gallery-featured-left`, `rc-gallery-featured-right`
- **Images**: `rc-image-one`, `rc-image-two`, `rc-image-left`, `rc-image-right`, `rc-image-half-left`, `rc-image-half-right`
- **Text**: `rc-text`, `rc-header-text`, `rc-text-two`
- **Authors**: `rc-author-left`, `rc-author-top`, `rc-author-above`
- **Reviews**: `rc-reviews-two`, `rc-reviews-threerow`, `pb-review-one`
- **Advantages**: `rc-advantages-two`, `rc-advantages-three`, `rc-advantages-four`
- **Info boxes**: `rc-infobox`, `rc-warning-two`, `rc-information-two`, `rc-success-one`
