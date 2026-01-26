# SCSS Design System Documentation

A comprehensive, modern SCSS design system with consistent colors, spacing, typography, and reusable components.

## File Structure

```
scss/
├── _variables.scss    # All design tokens (colors, spacing, typography, etc.)
├── _mixins.scss       # Reusable style patterns and functions
├── _reset.scss        # CSS reset and base styles
├── _utilities.scss    # Utility classes for quick styling
└── main.scss          # Main entry point (imports all files)
```

## Color System

### Color Palette

The design system uses a comprehensive color palette with semantic naming:

#### Neutrals (Dark Theme)

- `$color-neutral-950` to `$color-neutral-50` - Base grays for backgrounds and text

#### Primary (Vibrant Green)

- `$color-primary-900` to `$color-primary-100` - Main brand color
- Used for interactive elements, CTAs, focus states

#### Secondary (Deep Green)

- `$color-secondary-900` to `$color-secondary-300` - Complementary green
- Used for accents and secondary actions

#### Accent (Golden Yellow)

- `$color-accent-900` to `$color-accent-200` - Attention-grabbing highlight
- Used for important information and highlights

#### Status Colors

- **Success**: `$color-success-900` to `$color-success-400`
- **Warning**: `$color-warning-900` to `$color-warning-400`
- **Error**: `$color-error-900` to `$color-error-400`
- **Info**: `$color-info-900` to `$color-info-500`

### Semantic Color Tokens

Instead of using raw color values, use semantic tokens:

```scss
// Good
background-color: $bg-primary;
color: $fg-primary;
border-color: $border-primary;

// Avoid
background-color: $color-neutral-900;
color: $color-neutral-100;
```

**Backgrounds:**

- `$bg-primary` - Main background
- `$bg-secondary` - Slightly darker
- `$bg-tertiary` - Cards and elevated surfaces
- `$bg-elevated` - Modals, dropdowns
- `$bg-overlay` - Semi-transparent overlays

**Foregrounds:**

- `$fg-primary` - Main text
- `$fg-secondary` - Secondary text
- `$fg-tertiary` - Less important text
- `$fg-muted` - Hints and placeholders
- `$fg-disabled` - Disabled text

**Interactive:**

- `$interactive-primary` - Default state
- `$interactive-primary-hover` - Hover state
- `$interactive-primary-active` - Active/pressed state

**Borders:**

- `$border-primary` - Default borders
- `$border-secondary` - Subtle borders
- `$border-focus` - Focus rings
- `$border-error` / `$border-success` - Validation states

## Spacing System

Consistent spacing scale based on `0.25rem` (4px) increments:

```scss
$spacing-1  // 4px
$spacing-2  // 8px
$spacing-3  // 12px
$spacing-4  // 16px
$spacing-5  // 20px
$spacing-6  // 24px
$spacing-8  // 32px
$spacing-10 // 40px
$spacing-12 // 48px
$spacing-16 // 64px
$spacing-20 // 80px
$spacing-24 // 96px
$spacing-32 // 128px
```

**Usage:**

```scss
padding: $spacing-4;
margin-bottom: $spacing-6;
gap: $spacing-3;
```

## Typography

### Font Families

- `$font-primary` - System font stack for UI
- `$font-mono` - Monospace for code

### Font Sizes

```scss
$text-xs   // 12px
$text-sm   // 14px
$text-base // 16px (default)
$text-lg   // 18px
$text-xl   // 20px
$text-2xl  // 24px
$text-3xl  // 30px
$text-4xl  // 36px
$text-5xl  // 48px
$text-6xl  // 60px
```

### Font Weights

```scss
$font-light     // 300
$font-normal    // 400 (default)
$font-medium    // 500
$font-semibold  // 600
$font-bold      // 700
$font-extrabold // 800
```

### Typography Mixins

Pre-defined heading and body styles:

```scss
h1 {
  @include heading-1;
} // 36px, bold
h2 {
  @include heading-2;
} // 30px, bold
h3 {
  @include heading-3;
} // 24px, semibold
h4 {
  @include heading-4;
} // 20px, semibold
h5 {
  @include heading-5;
} // 18px, medium
h6 {
  @include heading-6;
} // 16px, medium

.large-text {
  @include body-large;
} // 18px
.base-text {
  @include body-base;
} // 16px
.small-text {
  @include body-small;
} // 14px
.caption {
  @include caption;
} // 12px, muted
```

## 🔧 Mixins

### Responsive Breakpoints

```scss
.component {
  // Mobile first
  padding: $spacing-4;

  @include sm {
    // ≥640px
    padding: $spacing-6;
  }

  @include md {
    // ≥768px
    padding: $spacing-8;
  }

  @include lg {
    // ≥1024px
    padding: $spacing-10;
  }

  // Max-width (mobile)
  @include max-md {
    // <768px
    display: block;
  }
}
```

### Flexbox

```scss
.container {
  @include flex-center; // Center both axes
  @include flex-between; // Space between items
  @include flex-column; // Column layout
  @include flex-column-center; // Centered column
}
```

### Buttons

```scss
.btn-primary {
  @include button-primary;
  @include button-size($button-height-md, $button-padding-x-md, $text-base);
}

.btn-secondary {
  @include button-secondary;
}

.btn-ghost {
  @include button-ghost;
}

.btn-destructive {
  @include button-destructive;
}
```

### Form Inputs

```scss
.input {
  @include input-base;
  @include input-size($input-height-md);
}
```

### Cards

```scss
.card {
  @include card;
  padding: $card-padding-md;

  &:hover {
    @include card-hover;
  }
}

.interactive-card {
  @include card-interactive; // Includes hover effects
}
```

### Typography Utilities

```scss
.truncate-text {
  @include text-truncate; // Single line ellipsis
}

.long-text {
  @include line-clamp(3); // Clamp to 3 lines
}
```

### Transitions & Animations

```scss
.button {
  @include transition(all);
  @include hover-lift; // Lifts up on hover
}

.icon {
  @include hover-scale(1.1); // Scales to 110% on hover
}
```

### Scrollbars

```scss
.scrollable-area {
  @include custom-scrollbar(); // Default styling
}

.hidden-scroll {
  @include hide-scrollbar(); // Hide scrollbar
}
```

### Loading States

```scss
.skeleton-loader {
  @include skeleton;
  height: 100px;
  border-radius: $radius-md;
}

.spinner {
  @include spinner(32px, 4px, $interactive-primary);
}
```

## Utility Classes

Quick styling with pre-built classes:

### Layout

```html
<div class="flex-center gap-4">
  <div class="flex-1">Content</div>
</div>

<div class="grid grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Spacing

```html
<div class="p-4 mb-6">
  <!-- padding: 1rem, margin-bottom: 1.5rem -->
  <div class="px-6 py-3">
    <!-- horizontal: 1.5rem, vertical: 0.75rem -->
    <div class="mt-8 mx-auto"><!-- margin-top: 2rem, horizontal: auto --></div>
  </div>
</div>
```

### Typography

```html
<h1 class="text-3xl font-bold mb-4">Title</h1>
<p class="text-base text-muted leading-relaxed">Paragraph</p>
<span class="text-sm font-medium uppercase">Label</span>
```

### Colors

```html
<div class="bg-surface text-primary border border-primary rounded-lg">
  <p class="text-error">Error message</p>
  <p class="text-success">Success message</p>
</div>
```

### Responsive

```html
<div class="md:hidden">Mobile only</div>
<div class="hidden md:flex">Desktop only</div>
```

## Component Examples

### Button Component

```scss
@import "variables";
@import "mixins";

.btn {
  @include button-base;
  @include button-size($button-height-md, $button-padding-x-md, $text-base);

  &--primary {
    @include button-primary;
  }

  &--secondary {
    @include button-secondary;
  }

  &--small {
    @include button-size($button-height-sm, $button-padding-x-sm, $text-sm);
  }

  &--large {
    @include button-size($button-height-lg, $button-padding-x-lg, $text-lg);
  }
}
```

### Card Component

```scss
.card {
  @include card;
  padding: $card-padding-md;

  &__header {
    @include flex-between;
    padding-bottom: $spacing-4;
    border-bottom: 1px solid $border-primary;
    margin-bottom: $spacing-4;
  }

  &__title {
    @include heading-4;
    color: $fg-primary;
  }

  &__content {
    @include body-base;
    color: $fg-secondary;
  }

  &:hover {
    @include card-hover;
  }
}
```

### Form Input Component

```scss
.form-group {
  margin-bottom: $spacing-4;

  label {
    display: block;
    @include body-small;
    font-weight: $font-medium;
    color: $fg-primary;
    margin-bottom: $spacing-2;
  }

  input,
  textarea {
    @include input-base;
    @include input-size($input-height-md);
  }

  textarea {
    height: auto;
    min-height: 100px;
    padding: $spacing-3;
  }

  .error-message {
    @include caption;
    color: $status-error;
    margin-top: $spacing-1;
  }
}
```

## Dark Theme

The current design system is optimized for dark mode. Colors are carefully chosen to:

- Provide good contrast (WCAG AA compliant)
- Reduce eye strain in low-light environments
- Create visual hierarchy through subtle variations

## Usage

### 1. Import in your main SCSS file:

```scss
@import "path/to/main.scss";

// Your custom styles below
```

### 2. Use variables and mixins:

```scss
.my-component {
  background-color: $bg-primary;
  color: $fg-primary;
  padding: $spacing-4;
  border-radius: $radius-md;
  @include transition(all);

  &:hover {
    background-color: $surface-hover;
  }
}
```

### 3. Or use utility classes directly in HTML:

```html
<div class="bg-surface p-6 rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-4">Title</h2>
  <p class="text-secondary">Content</p>
</div>
```

## Customization

### Changing Colors

Edit `_variables.scss` to customize the color palette:

```scss
// Change the primary color
$color-primary-600: hsl(200, 80%, 50%); // Blue instead of green

// This will automatically update:
$interactive-primary: $color-primary-600;
```

### Adding New Components

Create component files and import them in `main.scss`:

```scss
// components/_modal.scss
@import "../variables";
@import "../mixins";

.modal {
  @include fixed-cover;
  @include flex-center;
  background-color: $bg-overlay;
  z-index: $z-modal;

  &__content {
    @include surface-elevated;
    padding: $spacing-8;
    border-radius: $radius-xl;
    max-width: $modal-width-md;
  }
}
```

Then in `main.scss`:

```scss
@import "components/modal";
```

## Best Practices

1. **Use semantic tokens** instead of raw color values
2. **Follow spacing scale** - avoid arbitrary values like `13px`
3. **Mobile-first** - use min-width media queries
4. **Consistent naming** - Follow BEM or similar methodology
5. **Reuse mixins** - Don't repeat yourself
6. **Comment complex code** - Help future you
7. **Test accessibility** - Check color contrast ratios

## Responsive Design

Standard breakpoints:

- **xs**: 480px - Large phones
- **sm**: 640px - Tablets portrait
- **md**: 768px - Tablets landscape
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large desktops

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS custom properties support required

## Notes

- All spacing uses `rem` units for better accessibility
- Colors use HSL for easier manipulation
- Transitions use `cubic-bezier` for smooth animations
- Focus states are WCAG 2.1 compliant
- Scrollbars are styled for consistency across browsers
