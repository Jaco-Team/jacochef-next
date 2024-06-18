/** @type {import('next').NextConfig} */

import { getGlobals } from 'common-es'
const { __dirname, __filename } = getGlobals(import.meta.url)

const nextConfig = {
    sassOptions: {
        fiber: false,
    },
};

export default nextConfig;
