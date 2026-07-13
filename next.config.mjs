/** @type {import('next').NextConfig} */

import { getGlobals } from "common-es";
const { __dirname, __filename } = getGlobals(import.meta.url);

const nextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
