import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
    const base = process.env.BASE_PATH || "/";

    return {
        base,
        plugins: [react()],
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
