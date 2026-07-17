/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.seeklogo.com",
      },
      {
        protocol: "https",
        hostname: "ca.slack-edge.com",
      },
      {
        protocol: "https",
        hostname: "cdn.hackclub.com",
      },
    ],
  },
};

export default nextConfig;