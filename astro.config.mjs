import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://graceandwisewords.efrain-villanueva3.workers.dev",
  output: "server",
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["svgo"],
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "gl"],
  },
});
