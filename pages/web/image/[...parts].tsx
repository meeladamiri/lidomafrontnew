import { GetServerSideProps } from "next";

// Legacy Odoo image URLs — Google-Images-indexed via cdn.lidomatrip.com:
//   /web/image/product.image/182258/image/خانه-ویلایی-در-کیش.jpg   (gallery)
//   /web/image/product.template/22680/image/…                      (main image)
// 301 each to its migrated object-storage URL via the backend's
// legacy_image_redirects (built by scripts/migrate-odoo-image-urls.ts).
// The field segment ("image"/"image_medium"/…) and trailing SEO name are
// ignored — resolution is by model + odoo id. Unknown ids 404 (a redirect to
// a missing object would 404 anyway).
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const parts = (params?.parts as string[]) || [];
  const [model, id] = parts;

  if ((model === "product.image" || model === "product.template") && /^\d+$/.test(id || "")) {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
    try {
      const resp = await fetch(
        `${backendUrl}/api/search/legacy-image?model=${encodeURIComponent(model)}&id=${id}`
      );
      const data = await resp.json();
      if (data?.data?.target) {
        return { redirect: { destination: data.data.target, statusCode: 301 } };
      }
    } catch {
      // backend unreachable — fall through to 404
    }
  }

  return { notFound: true };
};

// Never rendered — getServerSideProps redirects or 404s.
export default function LegacyImageRedirect() {
  return null;
}
