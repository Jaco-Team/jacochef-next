/** @type {import('next').NextConfig} */

import { getGlobals } from "common-es";
const { __dirname, __filename } = getGlobals(import.meta.url);

const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
