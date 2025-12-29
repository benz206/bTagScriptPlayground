import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    await fs.cp(src, dest, { recursive: true, force: true });
}

const distDir = path.join(__dirname, "dist");

await copyDir(path.join(__dirname, "assets"), path.join(distDir, "assets"));
await copyDir(path.join(__dirname, "scripts"), path.join(distDir, "scripts"));
