import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { fixupConfigRules } from "@eslint/compat";

export default defineConfig([
    ...fixupConfigRules([...nextVitals, ...nextTs]),
    // Fluid registry sources are vendored as published; type checking includes them.
    globalIgnores([
        ".next/**",
        "out/**",
        "next-env.d.ts",
        "assets/**",
        "scripts/**",
        ".serena/**",
        "src/components/ui/**",
        "src/components/fluid-hover-highlight.tsx",
        "src/hooks/use-*.tsx",
        "src/hooks/use-fluid-hover.ts",
        "src/hooks/use-keyboard-nav-gate.ts",
        "src/lib/shape-context.tsx",
        "src/lib/icon-context.tsx",
        "src/lib/size-context.tsx",
        "src/lib/surface-context.tsx",
        "src/lib/elevated.tsx",
    ]),
]);
