import Lightbox from "yet-another-react-lightbox";
// import Captions from "yet-another-react-lightbox/plugins/captions"; // Note: Uncomment when using captions.
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
// import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
// import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
import { useRouter } from "next/router";
import { StaticImageData } from "next/image";
import getSlides from "./getSlides";

function CustomLightbox({
  isOpen,
  onClose,
  images,
  staticImages,
}: {
  isOpen: boolean;
  onClose: () => void;
  images?: {
    id: number;
    name?: string;
    url: string; // "https://cdn.lidomatrip.com/web/image/product.image/151395/image/منزل-لوکس-در-کیش.jpg"
  }[];
  staticImages?: StaticImageData[];
}) {
  const { query } = useRouter();

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      styles={{
        root: {
          "--yarl__color_backdrop": "#fff",
          "--yarl__color_button": "#000",
          "--yarl__thumbnails_thumbnail_background": "#fff",
          "--yarl__thumbnails_thumbnail_border": "none",
        },
      }}
      slides={
        !!images
          ? images.map((img) => ({
              src: img?.url,
              alt: img?.name,
            }))
          : !!staticImages
          ? getSlides(staticImages)
          : []
      }
      plugins={[
        // Captions,  // Note: Uncomment when using captions.
        Fullscreen,
        Slideshow,
        Thumbnails,
        // Video,
        Zoom,
      ]}
      // render={{ slide: NextJsImage }}
    />
  );
}
export default CustomLightbox;
