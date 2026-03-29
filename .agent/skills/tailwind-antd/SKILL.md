---
name: tailwind-antd
description: How to use Tailwind CSS v4 alongside Ant Design in this project — when to use each, how to avoid conflicts
---

# Skill: Tailwind CSS v4 + Ant Design Integration

## Setup

The project uses **Tailwind CSS v4** with **Ant Design 5** side by side, with CSS layers to prevent conflicts.

### Key files
- `postcss.config.mjs` — enables `@tailwindcss/postcss`
- `app/globals.scss` — layer declaration at top of file
- `components/Providers.tsx` — `<StyleProvider layer>` wraps antd

### CSS Layer order (globals.scss top)
```css
@layer theme, base, antd, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

### StyleProvider (Providers.tsx)
```tsx
import { StyleProvider } from "@ant-design/cssinjs";

<StyleProvider layer>
  <AntdRegistry>
    <ConfigProvider ...>
      <App>{children}</App>
    </ConfigProvider>
  </AntdRegistry>
</StyleProvider>
```

`<StyleProvider layer>` injects antd CSS into the `antd` layer → Tailwind utilities always win.

---

## What to use Tailwind for

```tsx
// ✅ Layout
<div className="flex items-center gap-3">
<div className="grid grid-cols-2 gap-4">

// ✅ Spacing
<div className="p-4 px-6 mt-2 mb-0">

// ✅ Sizing
<div className="w-full max-w-[420px] h-screen">

// ✅ Typography
<span className="text-sm font-semibold text-center">

// ✅ Override antd with ! prefix
<Button className="!w-full !mb-0 !justify-start">
<Form.Item className="!mb-8">
```

## What to keep in SCSS (globals.scss)

```scss
// ✅ CSS custom properties (design tokens)
color: var(--accent);
border: 1px solid var(--border);

// ✅ Antd component overrides
.ant-menu-item { ... }
.ant-card-body { ... }

// ✅ Animations
@keyframes fadeIn { ... }
animation: fadeIn 0.3s ease;

// ✅ Complex pseudo-selectors
&::-webkit-scrollbar { ... }
&:focus-within { ... }
```

## Mixed pattern (most common)

When a div needs CSS vars AND utility layout, split them:

```tsx
// ✅ Tailwind for layout, inline style for CSS var
<div className="flex items-center justify-between p-4"
  style={{ borderBottom: "1px solid var(--border)" }}>
```

## Never do

```scss
// ❌ @apply in SCSS — breaks with Tailwind v4
.my-class {
  @apply flex items-center; // DO NOT
}
```

```tsx
// ❌ Don't use static antd modal/notification (context warning)
Modal.confirm({ ... })     // ❌
message.success(...)       // ❌

// ✅ Use App.useApp() instead
const { modal, notification } = App.useApp();
modal.confirm({ ... })     // ✅
```
