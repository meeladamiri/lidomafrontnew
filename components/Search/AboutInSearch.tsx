import { sanitize } from "isomorphic-dompurify";

function AboutInSearch({ title, description }: { title: string; description: string }) {
  return (
    <div className="CustomContainer2 mb-54">
      <h2 className="text-16 leading-24 text-black font-m mb-16">{title}</h2>

      <p
        className="text-14 leading-28 text-black font-l"
        dangerouslySetInnerHTML={{
          __html: sanitize(description),
        }}
      ></p>
    </div>
  );
}

export default AboutInSearch;
