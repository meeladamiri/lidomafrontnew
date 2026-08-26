import { sanitize } from "isomorphic-dompurify";

function AboutInSearch({ title, description }: { title: string; description: string }) {
  return (
    <div className="CustomContainer2 mb-54">
      <h2 className="text-16 leading-24 text-black font-m mb-16">{title}</h2>

      {/* A <div>, not a <p>. The CMS text is HTML and routinely contains block
          tags (the city descriptions end in a stray `<p></p>`). A <p> may not
          contain one, so the browser's parser closed the outer paragraph early
          and the resulting DOM no longer matched what React had rendered —
          hydration failed on every search page and the server HTML was thrown
          away in favour of a full client render. */}
      <div
        className="text-14 leading-28 text-black font-l"
        dangerouslySetInnerHTML={{
          __html: sanitize(description),
        }}
      ></div>
    </div>
  );
}

export default AboutInSearch;
