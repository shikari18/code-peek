// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    preview: {
      allowedHosts: true,
    },
    server: {
      proxy: {
        // In development: proxy /api/abena-tts → Abena (avoids CORS)
        "/api/abena-tts": {
          target: "https://abena.mobobi.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/abena-tts/, "/playground/api/v1/tts/synthesize"),
          secure: true,
        },
      },
    },
  },
});

