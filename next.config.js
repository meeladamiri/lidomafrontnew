/** @type {import('next').NextConfig} */
// const runtimeCaching = require("next-pwa/cache");
// const { withPlaiceholder } = require("@plaiceholder/next");

const isProd = process.env.NODE_ENV === "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = require("next-pwa")({
  dest: "public",
  // runtimeCaching,
  maximumFileSizeToCacheInBytes: 7000000,
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  sw: "/sw.js",
  buildExcludes: [
    // /middleware-manifest.json$/
    () => true,
  ],
  register: true,
  skipWaiting: true,
  publicExcludes: ["!robots.txt", "!sitemap.xml.gz", "!assets/**/*", "**/*"],
  dynamicStartUrl: false,
  dynamicStartUrlRedirect: "/",
  mode: "production",
});

const nextConfig = {
  output: "standalone",
  reactStrictMode: true, // For Testing 'dnd', set reactStrictMode to false;
  compiler: {
    removeConsole: false,
  },
  swcMinify: isProd,
  images: {
    domains: ["cdn.lidomatrip.com", "test.lidomatrip.com", "lidomatrip.com", "next.lidomatrip.com"],
    // minimumCacheTTL: 30 * 24 * 60 * 60, // 30 days // for cached optimized images
    // Optimising SVGs has security downside. --> just testing to see the results
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // assetPrefix: isProd ? "https://cdn.lidomatrip.com" : undefined,
  generateBuildId: async () => {
    if (process.env.BUILD_ID) {
      return process.env.BUILD_ID;
    } else {
      return `${new Date().getTime()}`;
    }
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|webp|eot|ttf|woff)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 365 days
          },
        ],
      },
      {
        source: "/:all*(jpg|png|jpeg)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate", // 1 day
          },
        ],
      },
    ];
  },
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: "https://lidomatrip.com/api/:slug*",
      },
    ];
  },
  async redirects() {
    return [
      // START OF REDIRECTING PUBLIC PAGES ROUTES
      {
        source: "/page/contact-us",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/page/contactus",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/page/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/page/complaint",
        destination: "/complaint",
        permanent: true,
      },
      {
        source: "/page/rules",
        destination: "/rules",
        permanent: true,
      },
      // END OF REDIRECTING PUBLIC PAGES ROUTES
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
