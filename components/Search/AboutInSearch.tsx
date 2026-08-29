import { sanitize } from "isomorphic-dompurify";
import { useEffect, useId, useRef, useState } from "react";

/** Collapsed height. Roughly six lines at leading-28, plus the heading margin. */
const COLLAPSED_MAX_HEIGHT = 176;

/**
 * Puts the CMS body one level below the block's own title, and drops a heading
 * that just repeats that title.
 *
 * The guide text is authored as a standalone article, so it opens at `<h2>` —
 * the same level as `content_title` above it, and the same level as
 * "جستجوهای مرتبط". The Shiraz page ended up with seven `<h2>`s under the
 * `<h1>`, one of them the literal string "راهنمای رزرو اقامتگاه در شیراز",
 * which is `content_title` word for word. Nothing in the outline said which
 * headings belonged to the guide and which were siblings of it.
 *
 * Demoting from the bottom up (h4 first) keeps a heading from being moved
 * twice.
 */
function nestHeadings(html: string, ownTitle: string): string {
  let out = html;

  const title = ownTitle.trim();
  if (title) {
    // A heading whose text is exactly the block's own title is a duplicate of
    // it, not a section within it.
    out = out.replace(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, (match, _tag, inner) =>
      inner.replace(/<[^>]+>/g, "").trim() === title ? "" : match
    );
  }

  for (const level of [4, 3, 2]) {
    const from = `h${level}`;
    const to = `h${level + 1}`;
    out = out.replace(new RegExp(`<${from}(\\s[^>]*)?>`, "gi"), (_m, attrs) => `<${to}${attrs ?? ""}>`);
    out = out.replace(new RegExp(`</${from}>`, "gi"), `</${to}>`);
  }

  return out;
}

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
    <div className="CustomContainer2">
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
        {/*
          The CMS body arrives as bare HTML, and Tailwind's preflight strips the
          browser's default heading and list styles — so h3/ul/li rendered at
          body size with no spacing and the guide read as one undifferentiated
          wall of text. These arbitrary variants style the injected markup
          without a typography plugin.
        */}
        <div
          ref={bodyRef}
          id={bodyId}
          className="text-14 leading-28 text-black font-l overflow-hidden
            [&_h3]:text-15 [&_h3]:leading-24 [&_h3]:font-m [&_h3]:text-black [&_h3]:mt-24 [&_h3]:mb-8
            [&_h4]:text-14 [&_h4]:leading-22 [&_h4]:font-m [&_h4]:mt-16 [&_h4]:mb-6
            [&_p]:mb-12 [&_ul]:list-disc [&_ul]:pr-20 [&_ul]:mb-12 [&_ol]:list-decimal [&_ol]:pr-20 [&_ol]:mb-12
            [&_li]:mb-4 [&_a]:text-primary-main [&_a]:underline"
          style={{ maxHeight: collapsed ? COLLAPSED_MAX_HEIGHT : undefined }}
          dangerouslySetInnerHTML={{
            __html: nestHeadings(sanitize(description), title),
          }}
        ></div>

        {collapsed && (
          /* Fades to the section's own grey, not to white — against
             bg-gray-F0F0F0 a white fade reads as a pale band, not a fade. */
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 left-0 h-56 bg-gradient-to-t from-gray-F0F0F0 to-transparent"
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
