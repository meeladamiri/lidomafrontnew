/**
 * Checking and shrinking photos before they leave the phone.
 *
 * A modern phone camera produces 4–8 MB files. Twelve of those is most of a
 * host's data allowance and a minute of waiting on a hotel wifi, to store
 * something the site never displays above 1600px. Resizing in the browser is
 * the difference between a step that works on a phone and one that times out.
 *
 * Everything here fails soft. If the browser cannot decode the image — HEIC on
 * a desktop, an exotic codec, a canvas the OS refuses — the original file is
 * uploaded unchanged. A photo that arrives large is a much smaller problem
 * than a photo that does not arrive.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Longest edge after resizing. Above this, detail is stored and never shown. */
const MAX_EDGE = 1920;
/** Files under this are left alone; re-encoding them would only add artefacts. */
const SHRINK_ABOVE_BYTES = 1.2 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

export interface Rejection {
  file: File;
  reason: string;
}

export function validate(file: File): string | null {
  // Some Android browsers report an empty type for HEIC; fall back to the
  // extension rather than refusing a photo the server would have accepted.
  const looksLikeImage =
    file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!looksLikeImage) return "فقط فایل تصویری می‌توانید انتخاب کنید.";
  if (file.type && !ACCEPTED.includes(file.type) && !file.type.startsWith("image/")) {
    return "فرمت این تصویر پشتیبانی نمی‌شود.";
  }
  if (file.size > MAX_UPLOAD_BYTES) return "حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.";
  if (file.size === 0) return "این فایل خالی است.";
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("DECODE_FAILED"));
    };
    image.src = url;
  });
}

/** Returns a smaller file, or the original when shrinking is not worth it. */
export async function shrink(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (file.size < SHRINK_ABOVE_BYTES) return file;

  try {
    const image = await loadImage(file);
    const longest = Math.max(image.width, image.height);
    if (longest <= MAX_EDGE && file.size < MAX_UPLOAD_BYTES / 2) return file;

    const scale = Math.min(1, MAX_EDGE / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    // Could not decode it here; the server can.
    return file;
  }
}

export function humanSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} مگابایت`;
  return `${Math.round(bytes / 1024)} کیلوبایت`;
}
