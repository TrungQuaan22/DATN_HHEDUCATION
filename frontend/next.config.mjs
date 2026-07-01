/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@vidstack/react", "vidstack", "maverick.js"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "www.w3.org",
      },
      {
        protocol: "https",
        hostname: "pub-77edff2c782245799db963fbbfae0e94.r2.dev",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOSTNAME
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
