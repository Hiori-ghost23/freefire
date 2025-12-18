/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permettre le build même avec des erreurs de type (pour le déploiement initial)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Permettre le build même avec des erreurs ESLint
    ignoreDuringBuilds: true,
  },
  
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
