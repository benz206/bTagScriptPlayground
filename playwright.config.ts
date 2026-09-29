import { defineConfig, devices } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    use: {
        baseURL: `http://127.0.0.1:3000${basePath}/`,
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "bun run preview",
        url: `http://127.0.0.1:3000${basePath}/`,
        reuseExistingServer: !process.env.CI,
    },
});
