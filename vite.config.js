import { defineConfig } from "vite";

export default defineConfig(() => {
    const base = process.env.BASE_PATH || "/";

    return {
        base,
        build: {
            rollupOptions: {
                input: {
                    main: "index.html",
                    docs: "docs.html",
                },
            },
        },
    };
});
