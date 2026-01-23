import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    {
      name: "check-env-vars",
      config(config, { command }) {
        if (command === "build" && !process.env.VITE_API_URL) {
          console.warn(
            "\x1b[33m%s\x1b[0m", // Yellow color
            "\n⚠️  WARNING: VITE_API_URL is not set. The app may not work correctly in production.\n" +
              "   Please set VITE_API_URL in your Vercel project settings.\n"
          );
        }
      },
    },
  ],
});
