import { expect, test } from "@playwright/test";

test("processes a tag with the original API contract and inspects the result", async ({
    page,
}) => {
    let requests = 0;
    await page.route("**/v2/process/", async (route) => {
        requests++;
        const body = new URLSearchParams(route.request().postData()!);
        expect(body.get("tagscript")).toContain("greeting");
        expect(body.get("seeds")).toContain("Alex");
        await route.fulfill({
            json: {
                body: "Hello, Alex!",
                actions: { commands: ["ping"] },
                extras: { debug: { greeting: "Hello, Alex!" } },
            },
        });
    });
    await page.goto("./");
    await page.getByRole("button", { name: /^Run tag/ }).click();
    await expect(page.getByText("Hello, Alex!", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Actions · 1" }).click();
    await expect(page.getByRole("cell", { name: "commands" })).toBeVisible();
    await page.getByRole("tab", { name: "Debug · 1" }).click();
    await expect(page.getByRole("cell", { name: "greeting" })).toBeVisible();
    expect(requests).toBe(1);
});

test("shows network failures and prevents duplicate in-flight requests", async ({
    page,
}) => {
    let requests = 0;
    await page.route("**/v2/process/", async (route) => {
        requests++;
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.abort();
    });
    await page.goto("./");
    const run = page.getByRole("button", { name: /^Run tag/ });
    await run.click();
    await expect(run).toBeDisabled();
    await page.keyboard.press("Control+Enter");
    await expect(
        page.getByRole("alert").filter({ hasText: "could not be reached" }),
    ).toBeVisible();
    await expect(run).toBeEnabled();
    expect(requests).toBe(1);
});

test("restores scripts and switches to session storage", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
        localStorage.setItem("tagscript", "My saved tag"),
    );
    await page.reload();
    await expect(page.locator(".cm-content")).toContainText("My saved tag");
    await page
        .getByRole("button", { name: "Workspace settings", exact: true })
        .first()
        .click();
    await page.getByRole("radio", { name: "For this session" }).click();
    await page.keyboard.press("Escape");
    await expect
        .poll(() => page.evaluate(() => sessionStorage.getItem("tagscript")))
        .toBe("My saved tag");
    expect(
        await page.evaluate(() => localStorage.getItem("tagscript")),
    ).toBeNull();
    await page.reload();
    await expect(page.locator(".cm-content")).toContainText("My saved tag");
});

test("validates Carl imports, loads a valid import, and exports files", async ({
    page,
}) => {
    await page.route("**/https://carl.gg/api/v1/tags/123", (route) =>
        route.fulfill({ json: { content: "Hello from Carl" } }),
    );
    await page.goto("./");
    await page.getByRole("button", { name: "Import tag", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Carl tag ID or URL").fill("invalid");
    await dialog
        .getByRole("button", { name: "Import tag", exact: true })
        .click();
    await expect(dialog.getByRole("alert")).toContainText(
        "Enter a numeric tag ID",
    );
    await dialog.getByLabel("Carl tag ID or URL").fill("123");
    await dialog
        .getByRole("button", { name: "Import tag", exact: true })
        .click();
    await expect(page.locator(".cm-content")).toContainText("Hello from Carl");
    await page.getByRole("button", { name: "Script options" }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "Export script" }).click();
    expect((await download).suggestedFilename()).toBe("my-tag.tagscript");
});

test("renders all 30 Fluid components without browser errors", async ({
    page,
}) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("./");
    await page.getByRole("button", { name: "Components", exact: true }).click();
    await expect(page.locator("[data-component]")).toHaveCount(30);
    await page.getByRole("button", { name: "Try me", exact: true }).click();
    await expect(
        page.getByRole("button", { name: "Try me · 1" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Open a little space" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await page
        .getByRole("textbox", { name: "Gallery message" })
        .fill("A tiny idea");
    await page.getByRole("textbox", { name: "Gallery message" }).press("Enter");
    await expect(page.getByText("A tiny idea", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test("keeps the mobile workspace within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");
    await expect(
        page.getByRole("heading", { name: "Good tags start here." }),
    ).toBeVisible();
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: /toggle sidebar/i }).click();
    await expect(
        page.getByRole("button", { name: "Components", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Components", exact: true }).click();
    await expect(
        page.getByRole("heading", { name: "Fluid, by design." }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
});
