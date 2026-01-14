# Pobo Widget SDK

SCSS widget library for [Pobo Page Builder](https://www.pobo.cz). Provides styled UI components for e-commerce product pages.

## Requirements

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 9

## Installation

```bash
git clone git@github.com:pobo-builder/pobo-widget-sdk.git
cd pobo-widget-sdk
npm install
```

## Development

```bash
# BEM components (recommended)
npm run watch:generic    # http://localhost:8086

# Legacy components
npm run watch:standalone # http://localhost:8088

# Production build
npm run build
```

## Project Structure

```
src/
├── generic/                 # BEM components with CSS variables
│   ├── rc-*.scss            # Widget components
│   ├── part/                # Shared partials
│   └── plugin/              # Plugin styles
├── utils/
│   └── native-variable.scss # CSS custom properties
├── custom/                  # Client-specific styles
├── *.scss                   # Legacy components
├── editor.scss              # Legacy entry point
└── generic.scss             # BEM entry point

generic.html                 # BEM component examples
index.html                   # Legacy component examples
```

## Component Systems

### BEM System (Modern)
Located in `src/generic/`. Uses CSS custom properties with `--pobo-*` prefix for theming.

```scss
.rc-gallery-one {
  padding: var(--pobo-gallery-one-padding);
  // ...
}
```

### Legacy System
Located in `src/`. Uses hardcoded values.

```scss
.rc-gallery-one {
  padding: 0;
  // ...
}
```

## Creating Custom Widgets

1. Create a new branch:
```bash
git checkout -b "widget-[client]-[type]" origin/master
```

2. Create SCSS file in `src/custom/` with naming convention `[client]-[widget-type].scss`

3. Import in `src/editor.scss`:
```scss
@import "custom/[client]-[widget-type]";
```

4. Use BEM methodology with unique prefix:
```scss
.client-widget-name {
  &__title {
    font-size: 20px;
  }

  &__image {
    width: 100%;
  }
}
```

> **Note:** Do not use `.pb-*` or `.rc-*` prefixes - these are reserved for Pobo core widgets.

## Testing with ngrok

1. Start the proxy:
```bash
npm run proxy
```

2. Copy the public URL (e.g., `https://xxxx.ngrok.io`)

3. Find the CSS file path in browser dev tools

4. Add to Pobo at [pobo.cz/app/asset](https://www.pobo.cz/app/asset):
```scss
@import "https://xxxx.ngrok.io/index.xxxxx.css";
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Detailed conventions and patterns for AI assistants
- [Changelog](./version/) - Version history

## License

BSD-3-Clause
