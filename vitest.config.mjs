import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));
const testEnvironment = { NEXT_PUBLIC_API_URL: "http://chef.test/api" };

export default defineConfig({
  envDir: false,
  plugins: [
    {
      name: "chef-jsx-in-js",
      enforce: "pre",
      async transform(code, id) {
        const filename = id.split("?")[0];
        if (
          !filename.startsWith(root) ||
          filename.includes("/node_modules/") ||
          !filename.endsWith(".js")
        )
          return;
        return transformWithOxc(code, filename, { lang: "jsx", jsx: { runtime: "automatic" } });
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": root,
      "next/font/google": fileURLToPath(
        new URL("./tests/vitest/mocks/next-font.js", import.meta.url),
      ),
    },
  },
  define: {
    "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(testEnvironment.NEXT_PUBLIC_API_URL),
  },
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    env: testEnvironment,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/vitest/unit/**/*.test.{js,mjs}"],
          setupFiles: ["./tests/vitest/setup.node.js"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          environmentOptions: { jsdom: { url: "http://chef.test/" } },
          include: ["tests/vitest/components/**/*.test.{js,jsx,mjs}"],
          setupFiles: ["./tests/vitest/setup.dom.js"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "components/billing/**/*.{js,jsx}",
        "pages/billing/**/*.js",
        "components/cafe_edit/**/*.{js,jsx}",
        "src/helpers/access/handleUserAccess.js",
      ],
    },
  },
});
