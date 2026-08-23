import PageTitle from "@/components/General/PageTitle";

const AboutMizbanSection = ({
  containerClassname = "",
  desc,
}: {
  containerClassname?: string;
  desc: string;
}) => {
  return (
    <div className={`${containerClassname}`}>
      <PageTitle title={"درباره میزبان :"} asH1={false} containerClassname="mb-8 text-#031526" />

      {/* free text written by the host — keep their line breaks (see ResDescription) */}
      <p className="text-13 leading-22 text-[#031526] whitespace-pre-line">{desc}</p>
    </div>
  );
};

export default AboutMizbanSection;
