/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3000/:path*', // Backend Proxy
            },
        ];
    },
    outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
