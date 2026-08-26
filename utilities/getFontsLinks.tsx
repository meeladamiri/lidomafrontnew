/**
 * Preloads the two faces that paint above the fold.
 *
 * These were `rel="preconnect"` on same-origin font *files*, which the browser
 * ignores — preconnect takes an origin, not a path — so nothing was ever
 * preloaded and every page waited for the CSS to be parsed before it even
 * asked for a font.
 *
 * Only Regular and Medium are listed on purpose: preloading all seven faces
 * would push ~420KB of fonts ahead of the LCP image and make things worse.
 * The rest still load normally from `styles/font-faces.css` (all of them are
 * `font-display: swap`, so text paints immediately either way).
 */
export function getFontsLinks() {
  return (
    <>
      <link
        rel="preload"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
        href="/fonts/iranyekan/IRANYekanRegularFaNum.ttf"
      />
      <link
        rel="preload"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
        href="/fonts/iranyekan/IRANYekanMediumFaNum.ttf"
      />
    </>
  );
}

export default getFontsLinks;
