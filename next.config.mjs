/** @type {import('next').NextConfig} */

import { getGlobals } from "common-es";
const { __dirname, __filename } = getGlobals(import.meta.url);

const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
