import { useMediaQuery } from "@/utilities/useMediaQuery";
import Divider from "../../General/Divider";

interface IResVideo {
  video_url: string;
}

function ResVideo({ video_url }: IResVideo) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      <section className="pb-24">
        <header>
          <h2 className="mb-24 text-16 leading-28 text-zilgara font-m">ویدیو معرفی</h2>
        </header>

        <div className="h-[190px] md:h-[296px] w-full relative">
          <iframe
            className="w-full h-full rounded-16"
            // src="https://www.aparat.com/video/video/embed/videohash/XkdtR/vt/frame"
            src={video_url}
            allowFullScreen
            // webkitallowfullscreen
            // mozallowfullscreen="true"
          ></iframe>
        </div>
      </section>

      {!isDesktop && <Divider className="mb-24 md:hidden" />}
    </>
  );
}

export default ResVideo;
