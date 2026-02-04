import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "../../generated/prisma/enums": path.resolve(
        __dirname,
        "src/generated/prisma/enums",
      ),
      "../generated/prisma/client": path.resolve(
        __dirname,
        "src/generated/prisma/client",
      ),
    },
  },
});
