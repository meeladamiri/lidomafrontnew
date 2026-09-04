import Link from "next/link";
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnreadCount } from "@/api/chats";
import { useChatStream, type ChatStreamEvent } from "@/utilities/useChatStream";

/**
 * Unread messages, in the header.
 *
 * The count comes from a single sum on the server — the participant rows carry
 * it — so this is cheap enough to ask for on any page.
 *
 * It opens its own stream rather than sharing one with the conversations page.
 * That means two connections while someone is actually reading their messages,
 * which is worth it: the alternative is an event bus between a layout and a
 * page that may not be mounted, and a badge that silently stops counting is
 * the exact failure this is meant to prevent. The polling interval is the
 * floor for every page where the stream cannot be established at all.
 */

const POLL_MS = 60_000;

function ChatBadge({ isLight }: { isLight?: boolean }) {
  const queryClient = useQueryClient();

  const { data: count = 0 } = useQuery({
    queryKey: ["chat-unread"],
    queryFn: getUnreadCount,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });

  const onEvent = useCallback(
    (event: ChatStreamEvent) => {
      // Any of these can change the count; asking the server is one small
      // query and avoids trying to recompute it from partial information.
      if (event.type === "message" || event.type === "read") {
        queryClient.invalidateQueries({ queryKey: ["chat-unread"] });
      }
    },
    [queryClient]
  );

  useChatStream(true, onEvent);

  return (
    <Link
      prefetch={false}
      href="/chats"
      aria-label={count > 0 ? `چت، ${count} پیام خوانده‌نشده` : "چت"}
      className="relative hidden items-center md:flex"
    >
      <i
        aria-hidden="true"
        className={`icon-message cursor-pointer text-24 hover:text-primary-main ${
          isLight ? "text-white" : "text-black"
        }`}
      />
      {count > 0 && (
        <span className="absolute -left-6 -top-4 flex h-16 min-w-[16px] items-center justify-center rounded-full bg-primary-main px-4 text-10 leading-14 font-m text-white">
          {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
        </span>
      )}
    </Link>
  );
}

export default ChatBadge;
