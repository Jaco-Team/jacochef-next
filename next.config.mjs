/** @type {import('next').NextConfig} */

import { getGlobals } from "common-es";
const { __dirname, __filename } = getGlobals(import.meta.url);

const nextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(process.env.NODE_ENV === "development"
            ? [
                {
                  key: "Content-Security-Policy",
                  value:
                    "connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*",
                },
              ]
            : []),
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
