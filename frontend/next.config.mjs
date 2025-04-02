/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    experimental: {
        serverActions: {
            bodySizeLimit: '1000mb'
        }
    },
};

export default nextConfig;
