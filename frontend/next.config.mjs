/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    basePath: '',
    experimental: {
        serverActions: {
            bodySizeLimit: '1000mb'
        }
    },
};

export default nextConfig;
