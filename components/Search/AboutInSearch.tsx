import { sanitize } from "isomorphic-dompurify";
import { useEffect, useId, useRef, useState } from "react";

/** Collapsed height. Roughly six lines at leading-28, plus the heading margin. */
const COLLAPSED_MAX_HEIGHT = 176;

/**
 * The city guide text under the results.
 *
 * Collapsed to about six lines with a "مشاهده همه" toggle, because these
 * descriptions run several hundred words and pushed the FAQ block and the
 * footer far below the fold.
 *
 * The collapse is CSS only — `max-height` and `overflow`, never a substring.
 * The complete HTML is in the server response either way, so a crawler reads
 * all of it; cutting the string on the server would have traded the SEO value
 * of this text for the layout, which is the whole reason the block exists.
 * That also rules out `-webkit-line-clamp`: this is CMS HTML with `<p>` and
 * `<h2>` children, and line-clamp needs `display: -webkit-box`, which breaks
 * their layout.
 */
function AboutInSearch({ title, description }: { title: string; description: string }) {
  const [expanded, setExpanded] = useState(false);
  // Until measured, assume it needs the toggle: text this long almost always
  // does, and starting expanded then collapsing would shift the page.
  const [overflows, setOverflows] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyId = useId();

  // A short guide should not get a control that does nothing. Re-measured on
  // resize because the same text wraps to more lines on a narrow screen.
  useEffect(() => {
    const measure = () => {
      const el = bodyRef.current;
      if (!el) return;
      setOverflows(el.scrollHeight > COLLAPSED_MAX_HEIGHT + 8);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description]);

  const collapsed = overflows && !expanded;

  return (
    <div className="CustomContainer2 mb-54">
      <h2 className="text-16 leading-24 text-black font-m mb-16">{title}</h2>

      <div className="relative">
        {/* A <div>, not a <p>. The CMS text is HTML and routinely contains block
            tags (the city descriptions end in a stray `<p></p>`). A <p> may not
            contain one, so the browser's parser closed the outer paragraph early
            and the resulting DOM no longer matched what React had rendered —
            hydration failed on every search page and the server HTML was thrown
            away in favour of a full client render. */}
        {/*
          No transition on max-height, and no measured pixel height to expand
          to — expanded simply drops the cap.

          The animated version got stuck: the transition reported playState
          "running" indefinitely and the element stayed at its collapsed height,
          so the text could not be read at all. Whatever stalled it (animations
          are throttled in a backgrounded tab, and reduced-motion settings can
          interfere), tying "can this person read the page" to an animation
          completing is the wrong trade for 300ms of easing.
        */}
        <div
          ref={bodyRef}
          id={bodyId}
          className="text-14 leading-28 text-black font-l overflow-hidden"
          style={{ maxHeight: collapsed ? COLLAPSED_MAX_HEIGHT : undefined }}
          dangerouslySetInnerHTML={{
            __html: sanitize(description),
          }}
        ></div>

        {collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 left-0 h-56 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
          className="mt-12 flex items-center gap-x-6 text-14 leading-20 font-m text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main rounded-8"
        >
          {expanded ? "بستن" : "مشاهده همه"}
          <i
            aria-hidden="true"
            className={`icon-FlashDown text-16 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}

export default AboutInSearch;
