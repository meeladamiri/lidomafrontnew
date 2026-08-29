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
  // Lets a build run into a scratch directory while a dev server holds `.next`
  // (on Windows the two fight over the same files). Unset in normal use.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // StrictMode's dev-only double-mount leaves Swiper's Virtual module with
  // zero rendered slides (search-card image sliders show up empty in dev).
  // Production builds never double-mount, so this only changes dev behavior.
  reactStrictMode: false,
  compiler: {
    removeConsole: false,
  },
  swcMinify: isProd,

  // Type checking and linting do not run as part of the production build.
  //
  // They are not skipped — they moved. Liara's build has a twenty-minute
  // ceiling and was hitting it, and re-running tsc and eslint on a small build
  // container found nothing that `npm run verify` has not already found on a
  // developer's machine in a fraction of the time.
  //
  // The trade is real and worth stating: a type error that slips past a local
  // check is no longer caught before it reaches production. `npm run verify`
  // is what keeps that from happening, and `npm run deploy` runs it first so
  // it cannot be forgotten.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    // Trimmed from the defaults. Every `sizes`-based <Image> writes one
    // candidate URL per entry into the HTML, and these are ~120 bytes each —
    // on a listing page that is tens of kilobytes of markup. Nothing on the
    // site is displayed above 1920px, and the tiny icon widths were only ever
    // matched by avatars.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    domains: [
      "cdn.lidomatrip.com",
      "test.lidomatrip.com",
      "lidomatrip.com",
      "next.lidomatrip.com",
      "lidoma-uploads.storage.iran.liara.site",
    ],
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
  // Off by default: it roughly doubles what the build writes and ships a
  // `sourceMappingURL` on every chunk. Set SOURCE_MAPS=true when a production
  // stack trace actually needs decoding.
  productionBrowserSourceMaps: process.env.SOURCE_MAPS === "true",
  async rewrites() {
    // Proxies the frontend's own-origin `/api/*` calls to the real backend server-side,
    // so the browser never needs to know the backend's actual URL (no CORS, cookies stay same-site).
    //
    // This function runs at BUILD time, not per request. Next serialises whatever
    // it returns into `.next/routes-manifest.json`, and the production server
    // reads the routes from that file — it never calls this function again. So a
    // BACKEND_API_URL set in the Liara panel, which only exists at runtime, can
    // never reach the proxy.
    //
    // That is not theoretical. The panel read `http://lidoma:3000` while the
    // deployed front went on proxying to a port inside its own container:
    //
    //   Failed to proxy http://localhost:4000/api/favourites ECONNREFUSED
    //
    // Every browser-side call went down with it — login, the residence calendar,
    // favourites, and the header's city search — while the pages themselves kept
    // rendering, because server-side data fetching reads the runtime env directly
    // and was never affected. That split is what made it look like four bugs.
    //
    // Hence a production default that is already correct with no env at all. A
    // local `.env` still wins when present, so `npm run build && npm start` on a
    // developer machine keeps pointing at the local backend.
    const backendUrl =
      process.env.BACKEND_API_URL || (isProd ? "http://lidoma:3000" : "http://localhost:4000");
    return [
      {
        source: "/api/:slug*",
        destination: `${backendUrl}/api/:slug*`,
      },
      {
        // residence/user-uploaded images, served statically by the backend
        source: "/uploads/:slug*",
        destination: `${backendUrl}/uploads/:slug*`,
      },
      // Crawlers expect these at the site root. The backend generates them from
      // the sitemap settings, so they are proxied rather than duplicated here.
      {
        source: "/sitemap.xml",
        destination: `${backendUrl}/sitemap.xml`,
      },
      {
        source: "/sitemaps/:file",
        destination: `${backendUrl}/sitemaps/:file`,
      },
      {
        source: "/robots.txt",
        destination: `${backendUrl}/robots.txt`,
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
