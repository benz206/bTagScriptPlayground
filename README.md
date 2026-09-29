# bTagScript Playground

A TagScript workspace rebuilt with Next.js App Router, TypeScript, Tailwind CSS, and [Fluid Functionalism](https://www.fluidfunctionalism.com/). The app exports as static HTML/CSS/JavaScript for GitHub Pages.

## Run locally

Use **Bun 1.4.2** and **Node.js 24 LTS**. Bun manages dependencies and runs scripts; Next.js also requires Node.js.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000.

## Build and preview GitHub Pages

For this repository's project site:

```sh
NEXT_PUBLIC_BASE_PATH=/bTagScriptPlayground bun run build
NEXT_PUBLIC_BASE_PATH=/bTagScriptPlayground bun run preview
```

Open http://127.0.0.1:3000/bTagScriptPlayground/. The production files are in `out/`, including `.nojekyll`. The preview server serves these files directly, so missing assets and incorrect paths aren't hidden by an application fallback.

For a custom domain or an `owner.github.io` repository hosted at the domain root, omit `NEXT_PUBLIC_BASE_PATH` in both commands. Rebuild when changing the base path; Next.js embeds it into the client assets.

### Deploy

1. In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
2. Merge the feature branch into `master` and push.
3. The **Build and deploy GitHub Pages** workflow installs the frozen Bun lockfile, runs lint/type/unit checks, builds the static export, runs Chromium tests, and uploads `out/`.
4. Only a successful build on `master` deploys. Pull requests and pushes to `feat/fluid-next-playground` validate the site without replacing the deployed site. After the workflow exists on `master`, it can also be run manually from Actions.

The deployment reads the real Pages base path from `actions/configure-pages`, supporting project sites and configured custom domains. The expected project URL is https://leg3ndary.github.io/bTagScriptPlayground/. Environment protection rules may require a GitHub approval before the deployment job runs.

## What's included

- CodeMirror 6 editor with TagScript highlighting, line numbers, and Command/Control + Enter to run.
- Editable arguments, channel, user, and optional target seeds, with randomization and role color selection.
- Response preview, action inspection, structured debug variables, execution duration, and copy controls.
- Browser or session autosave, migration of the old `tagscript` storage key, local file import/export, and Carl tag imports.
- Example tags, a quick guide, light/dark themes, editor font-size settings, and a command palette.
- All **30 current Fluid component types**, with working examples in the Components gallery. See [the source inventory](docs/fluid-components.md).

## External services

Processing uses the existing `https://leg3ndary.pythonanywhere.com/v2/process/` endpoint and its form/seed encoding. Clicking **Run tag** sends the script and seed context to that service. The playground displays Discord actions; it does not execute them.

Carl imports use the project's existing Heroku proxy for `carl.gg`. Both services must be online and permit requests from the deployed origin. A static GitHub Pages site cannot provide a server-side CORS proxy. Failures display an error, preserve the editor text, and re-enable the controls. If Carl import is unavailable, paste the script or import a `.txt`/`.tagscript` file.

## Verification

```sh
bun run lint
bun run typecheck
bun run test
NEXT_PUBLIC_BASE_PATH=/bTagScriptPlayground bun run build
bunx playwright install chromium
NEXT_PUBLIC_BASE_PATH=/bTagScriptPlayground bun run test:e2e
```

Unit tests cover encoding, seed payloads, target selection, result validation, Carl URL parsing, and randomized seed consistency. Browser tests run against the static export and mock external APIs to verify successful runs, network failures, duplicate request prevention, saved scripts, imports/exports, the full gallery, and mobile layout without depending on external service uptime.

The current stack is Next.js 16.3.7, React 19.3, Tailwind 4.3, and TypeScript 7.0.2. TypeScript 7's native compiler is installed as `@typescript/native`; the `typescript` alias provides Microsoft's TypeScript 6 compatibility API for Next.js/ESLint tooling. ESLint 10 uses its official compatibility adapter for the Next.js React plugin. Exact resolved dependencies are recorded in `bun.lock`.

## License

The original project [MIT license](LICENSE) is retained. Fluid component provenance and update instructions are in [docs/fluid-components.md](docs/fluid-components.md).
