import Image from "next/image";
import Link from "next/link";

function TripGuideArticleCart({
  title,
  writerName,
  writerImage,
  linkToGo,
  articleImage,
}: {
  title: string;
  writerName: string;
  writerImage: string;
  linkToGo: string;
  articleImage: string;
}) {
  return (
    <Link prefetch={false} passHref href={linkToGo} className="block w-full relative h-[214px]">
      <Image
        src={articleImage}
        fill
        style={{ objectFit: "cover" }}
        alt={title}
        className="rounded-12"
      />

      <div className="absolute z-1 right-12 left-12 bottom-12 flex items-center justify-between gap-x-8">
        <div className="w-[calc(100%-56px)]">
          <p className="mb-4 text-14 leading-24 font-r text-white OnlyOneLineAndEndWithElipsis hover:!text-primary-main">
            {title}
          </p>
          <p className="text-12 leading-21 font-l text-white">نویسنده : {writerName}</p>
        </div>

        {/* <div className="w-48 h-48 bg-white rounded-full relative shrink-0">
          <Image
            src={writerImage}
            fill
            style={{ objectFit: "cover" }}
            alt={writerName}
            className="rounded-full border-1 border-solid border-white"
          />
        </div> */}
      </div>

      {/* that faded black layer on image  */}
      <div
        className="h-[151px] absolute w-full bottom-0 right-0 rounded-br-12 rounded-bl-12"
        style={{
          background: "linear-gradient(180deg, rgba(78, 93, 113, 0) 32.78%, #18273A 100%)",
        }}
      />
    </Link>
  );
}

export default TripGuideArticleCart;
