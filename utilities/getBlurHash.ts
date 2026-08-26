import all_blur_hashes_data from "@/constants/all_blur_hashes";

/**
 * Picks one of the canned blur placeholders for an image.
 *
 * Call sites used to do `all_blur_hashes_data[Math.floor(Math.random() * ...)]`
 * inline, which chose a different placeholder on the server than on the client.
 * React saw the `style` prop (the placeholder rides in `background-image`)
 * change between the two renders and failed hydration for the whole page, so
 * the server HTML was discarded and everything re-rendered on the client.
 *
 * Deriving the index from the image URL keeps the choice stable across renders
 * and machines while still spreading different images over different
 * placeholders.
 */
export function getBlurHash(key: string | undefined | null): string {
  const value = key || "";
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return all_blur_hashes_data[Math.abs(h) % all_blur_hashes_data.length];
}

export default getBlurHash;
