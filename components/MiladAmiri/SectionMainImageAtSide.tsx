import Image, { StaticImageData } from "next/image";

function SectionMainImageAtSide({ imgSrc }: { imgSrc: StaticImageData }) {
  return (
    <div className="w-[35%] h-[280px] shrink-0 relative hidden md:block">
      <Image src={imgSrc} fill style={{ objectFit: "cover", borderRadius: "12px" }} alt="" />
    </div>
  );
}

export default SectionMainImageAtSide;
