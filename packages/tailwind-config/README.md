# Treasure Tailwind Config

Reusable [Tailwind CSS](https://tailwindcss.com) configuration preset for the Treasure ecosystem. This allows projects to build with colors, fonts and other common customizations that follow the Treasure design system.

## Installation

```bash
pnpm add -D @treasure-dev/tailwind-config
```

In `tailwind.config.js`, add the config as a preset:

```js
presets: [require('@treasure-dev/tailwind-config')],
```

### Fonts

If you also wish to use the Treasure design system fonts, import them in the root of your app:

#### General

```js
import "@treasure-dev/tailwind-config/fonts.css";
```

#### Remix

```js
import fontStylesheet from "@treasure-dev/tailwind-config/fonts.css";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: fontStylesheet },
  { rel: "stylesheet", href: stylesheet },
];
```

Now you can use the font via Tailwind using (`font-sans` and `font-mono`) or from a stylesheet:

```css
body {
  font-family: "Whyte", sans-serif;
}
```
