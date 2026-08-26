/**
 * The og:image fallback.
 *
 * The site used to point og:image at `assets/logos/Lidoma-logo2.svg`. Neither
 * Google nor any of the social networks render SVG for a preview card, so every
 * share came out blank. Pages that have a photograph of their own should use it
 * — a listing photo beats a logo — and this is what is left when they do not.
 *
 * Must be a JPG or PNG, and 1200x630 is the size the networks crop to.
 */
export const SOCIAL_FALLBACK_IMAGE = "https://lidomatrip.com/assets/og/lidomatrip-1200x630.jpg";

export default SOCIAL_FALLBACK_IMAGE;
