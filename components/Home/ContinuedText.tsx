import { sanitize } from "isomorphic-dompurify";
import { useEffect, useRef, useState } from "react";
import classes from "styles/line-clamps.module.css";

function ContinuedText({
  videoUrl,
  // image,
  title,
  desc,
  isReverse,
}: {
  videoUrl: JSX.Element;
  // image: string;
  title: string;
  desc: string;
  isReverse?: boolean;
}) {
  const textBoxRef = useRef<any>();
  const [showSeeMoreBtn, setShowSeeMoreBtn] = useState(false);
  const [showMoreText, setShowMoreText] = useState(false);

  useEffect(() => {
    const refToTextBoxEl = textBoxRef.current;

    const observer = new ResizeObserver((entries) => {
      //   console.log("entries are: ", entries);
      for (const entry of entries) {
        // Note: it works with tolerance of 5;
        if (entry.target.scrollHeight - entry.contentRect.height > 5) {
          // console.log("its more");
          setShowSeeMoreBtn(true);
        } else {
          setShowSeeMoreBtn(false);
        }
      }
    });

    observer.observe(refToTextBoxEl);

    return () => {
      observer.unobserve(refToTextBoxEl);
    };
  }, []);

  return (
    <div>
      <div
        className={`
          flex items-start flex-wrap sm:flex-nowrap md:flex-nowrap gap-x-24 gap-y-16
          ${isReverse ? "sm:flex-row-reverse md:flex-row-reverse" : ""}
        `}
      >
        <div className="w-full sm:w-320 md:w-320 h-[200px] shrink-0 relative">{videoUrl}</div>

        <div className="grow">
          <h2 className="text-16 leading-24 text-black font-m mb-12 md:mb-16">{title}</h2>

          <div className="">
            <p
              ref={textBoxRef}
              className={`
                text-14 leading-20 text-black font-l ${classes["line-clamp-5"]} md:!block
                ${!!showMoreText ? "!block" : ""}
              `}
              dangerouslySetInnerHTML={{ __html: sanitize(desc) }}
            >
              {/* {desc} */}
            </p>
          </div>
        </div>
      </div>

      {(!!showSeeMoreBtn || !!showMoreText) && (
        <p
          className="mt-12 flex items-center gap-x-4 text-14 leading-24 font-m text-black sm:hidden md:hidden"
          onClick={() => setShowMoreText((prev) => !prev)}
        >
          {!!showMoreText ? "بستن" : "ادامه مطلب"}
          <i
            className={`
              icon-FlashDown text-24 text-black
              ${!!showMoreText ? "rotate-180" : ""}
            `}
          />
        </p>
      )}
    </div>
  );
}

export default ContinuedText;
