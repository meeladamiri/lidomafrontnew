import Image from "next/image";

interface IUnHappyMessage {
  iconSrc: JSX.Element | string; // Ex: "/assets/No-reserve.svg"
  title: string;
  subTitle?: string | JSX.Element;
  actions?: JSX.Element;
  containerClassname?: string;
}

function UnHappyMessage({
  iconSrc,
  title,
  subTitle,
  actions,
  containerClassname,
}: IUnHappyMessage) {
  return (
    <div className={`flex flex-col items-center w-full ${containerClassname || ""}`}>
      {typeof iconSrc !== "string" ? (
        iconSrc
      ) : (
        <div className="w-[210px] h-[172px] relative">
          <Image
            src={iconSrc}
            alt=""
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      )}

      <p className="mt-24 text-18 leading-32 text-black font-m text-center">{title}</p>

      {subTitle && (
        <p className="mt-16 text-center text-12 leading-21 text-black font-r">{subTitle}</p>
      )}

      {!!actions && <div className="mt-36 w-full">{actions}</div>}
    </div>
  );
}

export default UnHappyMessage;
