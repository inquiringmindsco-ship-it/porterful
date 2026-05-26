/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // Safe redirect: brand-facing URL → canonical slug
      // Do not change database slug. Alias only.
      {
        source: '/artist/ray-of-sunshine',
        destination: '/artist/melanie-dyson-o2jf',
        permanent: false, // 307 Temporary Redirect (safe for future slug changes)
      },
    ];
  },
};

export default nextConfig;
