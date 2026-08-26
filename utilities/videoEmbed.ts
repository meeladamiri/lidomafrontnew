/**
 * Turns whatever an editor pastes into an embeddable player URL.
 *
 * Aparat gives people three different links for the same video — the watch
 * page (`/v/<hash>`), the share embed (`/video/video/embed/videohash/<hash>/vt/frame`)
 * and sometimes just the hash — and only the middle one works in an <iframe>.
 * Asking editors to know that is how the videos ended up hardcoded in the page
 * in the first place.
 *
 * Returns null when there is nothing to embed, so callers can skip the block.
 */
export function toEmbedUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  // Already an embed URL.
  if (/aparat\.com\/video\/video\/embed\//i.test(value)) return value;

  const aparat = /aparat\.com\/(?:v|embed)\/([A-Za-z0-9_-]+)/i.exec(value);
  if (aparat) {
    return `https://www.aparat.com/video/video/embed/videohash/${aparat[1]}/vt/frame`;
  }

  const youtube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i.exec(value);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  // A bare Aparat hash.
  if (/^[A-Za-z0-9_-]{4,12}$/.test(value)) {
    return `https://www.aparat.com/video/video/embed/videohash/${value}/vt/frame`;
  }

  // A direct file or an already-embeddable third-party URL.
  if (/^https?:\/\//i.test(value)) return value;

  return null;
}

/** True when the URL points at a video file we can play with <video>. */
export function isVideoFile(url: string | null): boolean {
  return !!url && /\.(mp4|webm|ogg|m4v)(\?|$)/i.test(url);
}

export default toEmbedUrl;
