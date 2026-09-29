# Fluid Functionalism sources

Installed from the official [Fluid Functionalism registry](https://www.fluidfunctionalism.com/r/registry.json) on 2026-09-29 using the current shadcn CLI. The project uses the Radix implementation of each component; Base UI alternatives are duplicate implementations, not additional component types.

The playground uses Fluid components for its existing controls, seed forms, output, navigation, and dialogs, together with the shared motion, elevation, and theme utilities. Components used only by the removed showcase are not included.

## Updating

The source lives in `src/components/ui`, `src/components/fluid-hover-highlight.tsx`, the shared `src/hooks` files, and the registry utility files in `src/lib`. Application code imports these sources directly. The registry doesn't publish semantic component versions; `bun.lock` records their package dependencies, and Git records the installed component snapshot.

```sh
bunx --bun shadcn@latest add @fluid/button --overwrite
```

Replace `button` with the desired registry name. Review the diff before committing. `components.json` contains the registry URL and installation aliases. Use the same Radix flavor when updating.

The registry source is kept as published and excluded from app lint rules. It remains part of strict TypeScript checks and the production build.

The Inter variable font is bundled locally through `@fontsource-variable/inter`, including the weight axis used by Fluid's hover animations. No font CDN is required at build or runtime.
