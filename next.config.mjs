/** @type {import('next').NextConfig} */

import { getGlobals } from 'common-es'
const { __dirname, __filename } = getGlobals(import.meta.url)

import path from "path"

const nextConfig = {
    sassOptions: {
        fiber: false,
    },
};

export default nextConfig;
