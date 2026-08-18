import { miladiToJalali } from "@/utilities/dateTools";
import { useEffect, useRef } from "react";
import ChatMessageBox from "./ChatMessageBox";

interface IChatMessagesSection {
  rightEndAvatar: string;
  leftEndAvatar: string;
  payamHa: {
    id: number;
    senderName: string;
    text: string;
    seen: boolean;
    time: string;
    date: string;
  }[];
  leftSideName: string;
  rightSideName: string;
}

function ChatMessagesSection({
  rightEndAvatar,
  leftEndAvatar,
  payamHa,
  leftSideName,
  rightSideName,
}: IChatMessagesSection) {
  const bottomOfChatSectionRef = useRef<any>(null);

  useEffect(() => {
    if (!!payamHa.length) {
      bottomOfChatSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [payamHa.length]);

  return (
    <div>
      {payamHa.map((payam, index) => {
        return (
          <ChatMessageBox
            key={payam.id}
            avatar={payam.senderName === leftSideName ? leftEndAvatar : rightEndAvatar}
            isRightEndMessage={payam.senderName === rightSideName}
            text={payam.text}
            seen={payam.seen}
            date={miladiToJalali(payam.date)}
            time={payam.time}
          />
        );
      })}

      <div ref={bottomOfChatSectionRef}></div>
    </div>
  );
}

export default ChatMessagesSection;
