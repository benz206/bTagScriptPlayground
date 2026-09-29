import { resolve, sep } from "node:path";

const root = resolve("out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const server = Bun.serve({
    hostname: "127.0.0.1",
    port: Number(process.env.PORT ?? 3000),
    async fetch(request) {
        let pathname: string;
        try {
            pathname = decodeURIComponent(new URL(request.url).pathname);
        } catch {
            return new Response("Bad request", { status: 400 });
        }
        if (basePath && pathname === basePath)
            return Response.redirect(
                `${new URL(request.url).origin}${basePath}/`,
                308,
            );
        if (basePath && !pathname.startsWith(`${basePath}/`))
            return new Response("Not found", { status: 404 });
        const relative = pathname.slice(basePath.length).replace(/^\//, "");
        const path = resolve(
            root,
            relative.endsWith("/") || !relative
                ? `${relative}index.html`
                : relative,
        );
        if (!path.startsWith(`${root}${sep}`))
            return new Response("Forbidden", { status: 403 });
        const file = Bun.file(path);
        return (await file.exists())
            ? new Response(file)
            : new Response("Not found", { status: 404 });
    },
});
console.log(`Static preview: http://127.0.0.1:${server.port}${basePath}/`);
