import Image from "next/image";

interface IChatMessageBox {
  avatar: string;
  isRightEndMessage: boolean;
  text: string;
  seen: boolean;
  time: string;
  date: string;
}

function ChatMessageBox({ avatar, isRightEndMessage, text, seen, date, time }: IChatMessageBox) {
  return (
    <div className="w-full mb-12 last:mb-0" dir={isRightEndMessage ? "rtl" : "ltr"}>
      <div
        className={`
            flex items-start gap-x-8 max-w-[80%]
        `}
      >
        <div className="w-32 h-32 rounded-full relative bg-white shrink-0">
          {!!avatar && (
            <Image
              src={avatar}
              alt="آواتار"
              className="rounded-full"
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div
          dir="rtl"
          className={`
            px-16 pt-8 pb-2
            ${isRightEndMessage ? "bg-white" : "bg-paleGreen"}
            rounded-12
            ${isRightEndMessage ? "rounded-tr-0" : "rounded-tl-0"}
        `}
        >
          <p
            className="text-14 leading-24 text-black font-r whitespace-pre-wrap mb-8"
            style={{
              lineBreak: "anywhere",
              msLineBreak: "anywhere",
              WebkitLineBreak: "anywhere",
            }}
          >
            {text}
          </p>
          <p className="flex items-center gap-x-8">
            {!!isRightEndMessage && (
              <span>
                {seen ? (
                  <Image
                    src="/assets/non-icomoon-icons/double-tick.svg"
                    width={13}
                    height={7}
                    alt=""
                  />
                ) : (
                  <Image
                    src="/assets/non-icomoon-icons/single-tick.svg"
                    width={9}
                    height={6}
                    alt=""
                  />
                )}
              </span>
            )}

            <span className="text-8 leading-14 text-black font-l">{time}</span>
            <span className="text-8 leading-14 text-black font-l">{date}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBox;
