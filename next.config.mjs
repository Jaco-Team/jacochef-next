/** @type {import('next').NextConfig} */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const nextConfig = {
  output: "standalone",
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "src")  // <-- adjust "src" if your code folder is root
    }
  }
};

export default nextConfig;
