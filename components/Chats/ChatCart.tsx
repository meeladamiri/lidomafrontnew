import { IChat } from "@/api/chats";
import { Button } from "components/General/core/Button";
import Image from "next/image";
import { useRouter } from "next/router";

interface IChatCart {
  action?: IChat["action"];
  name: string;
  image: string;
  from: string;
  to: string;
  reserveCode: string;
  isFinished: boolean;
  chatId: number;
  hasAroundBorder?: boolean;
  onSelectChat?: (chatId: number) => void;
}

function ChatCart({
  name,
  image,
  from,
  to,
  reserveCode,
  isFinished,
  chatId,
  action,
  hasAroundBorder = true,
  onSelectChat,
}: IChatCart) {
  const router = useRouter();

  return (
    <div
      className={`
        p-12 flex items-center gap-x-4
        ${!!hasAroundBorder ? "border-1 border-solid border-gray-C4CAD3 rounded-12" : ""}
      `}
    >
      <div className="w-48 h-48 relative shrink-0">
        <Image
          src={image}
          alt="آواتار"
          className="rounded-full"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="flex flex-col gap-y-12 w-[calc(100%-152px)]">
        <p className="text-14 leading-24 text-black font-m OnlyOneLineAndEndWithElipsis">{name}</p>
        <div className="OnlyOneLineAndEndWithElipsis">
          <p className="text-12 leading-21 text-black font-r inline align-middle">{from}</p>
          <i className="icon-CalendarFlash text-14 text-black inline align-middle" />
          <p className=" text-12 leading-21 text-black font-r inline align-middle">{to}</p>
        </div>
      </div>

      <div className="w-[96px] flex flex-col gap-y-4 shrink-0 ">
        <div className="text-10 leading-21 text-[rgba(28,46,69,0.6)] font-l flex items-center justify-center gap-x-2">
          <p> کد رزرو : </p>
          <p>{reserveCode}</p>
        </div>
        {isFinished ? (
          <Button
            onClick={() => {
              if (!!onSelectChat) {
                onSelectChat(chatId);
              } else {
                router.push(`/chats/${chatId}`);
              }
            }}
            isFullWidth
            color="secondary"
          >
            مشاهده
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (!!onSelectChat) {
                onSelectChat(chatId);
              } else {
                router.push(`/chats/${chatId}`);
              }
            }}
            isFullWidth
          >
            {action === "start" ? "شروع" : "ادامه"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ChatCart;
