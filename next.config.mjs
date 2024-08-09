/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   images: {
//       remotePatterns: [
//           {
//               protocol: 'https',
//               hostname: 'lh3.googleusercontent.com',
//           },
//           {
//               protocol: 'https',
//               hostname: 'avatars.githubusercontent.com',
//           },
//       ],
//   },
//   async headers() {
//       return [
//           {
//               // matching all API routes
//               source: "/api/:path*",
//               headers: [
//                   { key: "Access-Control-Allow-Origin", value: "*" },
//                   { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
//                   { key: "Access-Control-Allow-Headers", value: "User-Agent, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
//               ]
//           },
//           {
//               // Apply these headers to all other routes (not API)
//               source: '/(.*)',
//               headers: [
//                   {
//                       key: 'Cross-Origin-Opener-Policy',
//                       value: 'same-origin',
//                   },
//                   {
//                       key: 'Cross-Origin-Embedder-Policy',
//                       value: 'require-corp',
//                   },
//               ],
//           },
//       ]
//   }
// };

// export default nextConfig;

export default {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  experimental: {
    // No 'appDir' key here
  },
};
