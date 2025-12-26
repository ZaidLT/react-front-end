/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Function to copy SVG assets to public directory during build
function copySvgAssets() {
  const srcDir = path.join(__dirname, 'src/assets');
  const publicDir = path.join(__dirname, 'public');

  // Create necessary directories
  if (!fs.existsSync(path.join(publicDir, 'assets'))) {
    fs.mkdirSync(path.join(publicDir, 'assets'), { recursive: true });
  }
  if (!fs.existsSync(path.join(publicDir, 'hive-icons'))) {
    fs.mkdirSync(path.join(publicDir, 'hive-icons'), { recursive: true });
  }
  if (!fs.existsSync(path.join(publicDir, 'category-icons'))) {
    fs.mkdirSync(path.join(publicDir, 'category-icons'), { recursive: true });
  }

  // Copy SVG files from hive-icons directory
  const hiveIconsDir = path.join(srcDir, 'hive-icons');
  if (fs.existsSync(hiveIconsDir)) {
    fs.readdirSync(hiveIconsDir)
      .filter((file) => file.endsWith('.svg'))
      .forEach((file) => {
        fs.copyFileSync(
          path.join(hiveIconsDir, file),
          path.join(publicDir, 'hive-icons', file)
        );
      });
  }

  // Copy SVG files from category-icons directory
  const categoryIconsDir = path.join(srcDir, 'category-icons');
  if (fs.existsSync(categoryIconsDir)) {
    fs.readdirSync(categoryIconsDir)
      .filter((file) => file.endsWith('.svg'))
      .forEach((file) => {
        fs.copyFileSync(
          path.join(categoryIconsDir, file),
          path.join(publicDir, 'category-icons', file)
        );
      });
  }

  console.log('SVG assets copied to public directory - updated');
}

// Run the copy operation when this file is loaded (during build)
try {
  copySvgAssets();
} catch (error) {
  console.error('Error copying SVG assets:', error);
}

const nextConfig = {
  reactStrictMode: false, // Disabled to prevent duplicate API calls in development
  devIndicators: false,
  // Ignore ESLint errors during build to prevent warnings from failing the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
  // Using App Router by default in Next.js 13+
  // Maintain compatibility with existing code
  transpilePackages: ['react-html-parser', 'react-code-input'],
  // Handle images from external sources
  images: {
    domains: [
      'node-backend-eeva.vercel.app', // Legacy domain (can be removed later)
      'api.eeva.app', // Production API
      'dev.api.eeva.app', // Development API
      'storage.googleapis.com', // Google Cloud Storage for avatar images
    ],
    // Added to support Next.js Image component for files stored in Azure Blob Storage and Google Cloud Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eevadevblob.blob.core.windows.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '**',
      },
    ],
  },
  // Redirects
  async redirects() {
    return [
      // Redirect old page paths to new App Router paths
      {
        source: '/IconDemo',
        destination: '/icon-demo',
        permanent: true,
      },
      // Add other redirects here if needed, but avoid redirecting to the same path
    ];
  },
  // API rewrites - use the Next.js API route in all environments
  async rewrites() {
    return [
      // Handle auth-related API routes directly
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Handle test API route directly
      {
        source: '/api/test-api',
        destination: '/api/test-api',
      },
      // Handle all tile-related API routes with a single wildcard rule
      {
        source: '/api/tiles/:path*',
        destination: '/api/tiles/:path*',
      },
      // Handle all task-related API routes directly
      {
        source: '/api/tasks/:path*',
        destination: '/api/tasks/:path*',
      },
      // Handle all contact-related API routes directly
      {
        source: '/api/contacts/:path*',
        destination: '/api/contacts/:path*',
      },
      // Handle all user-related API routes directly
      {
        source: '/api/users/:path*',
        destination: '/api/users/:path*',
      },
      // Handle all file-events API routes directly
      {
        source: '/api/file-events/:path*',
        destination: '/api/file-events/:path*',
      },
      // Handle calendars API route directly (returns 404)
      {
        source: '/api/calendars/:path*',
        destination: '/api/calendars/:path*',
      },
      // Use the general API proxy for all other API routes
      // Whitelist events API to hit our local routes
      {
        source: '/api/events',
        destination: '/api/events',
      },
      {
        source: '/api/events/:path*',
        destination: '/api/events/:path*',
      },
      // Use the general API proxy for all other API routes
      {
        source: '/api/:path*',
        destination: '/api/proxy/:path*',
      },
    ];
  },

  // Handle asset files
  webpack(config) {
    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    // Handle canvas for PDF.js (required by pdfjs-dist)
    // Canvas is a Node.js module that doesn't work in the browser
    // Setting it to false tells webpack to ignore it
    config.resolve.alias.canvas = false;

    return config;
  },
};

module.exports = nextConfig;
