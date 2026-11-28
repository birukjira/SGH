import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // `next dev` 403s its dev-only assets (HMR, RSC payloads) when the page is
  // opened as 127.0.0.1 instead of localhost, which leaves the site visible but
  // dead to clicks. Allow both spellings of the loopback host in development.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async redirects() {
    return [
      // Legacy flat HTML URLs -> App Router routes.
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/visit.html', destination: '/visit', permanent: true },
      { source: '/appointment.html', destination: '/appointment', permanent: true },
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      { source: '/doctors.html', destination: '/doctors', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
    ];
  },
};

export default nextConfig;
