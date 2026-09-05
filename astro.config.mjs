import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://gracewisewords.com",
  output: "server",
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: ["svgo"],
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "gl"],
  },
});
