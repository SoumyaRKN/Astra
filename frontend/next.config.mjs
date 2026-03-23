/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    outputFileTracingRoot: "/home/nsoumyaprakash/Desktop/Personal/Projects/Astra",
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://127.0.0.1:8000/:path*",
            },
        ];
    },
};

export default nextConfig;
