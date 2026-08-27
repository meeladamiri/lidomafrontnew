import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConversation,
  getMessages,
  markConversationRead,
  newNonce,
  sendChatMessage,
  sendTyping,
  type IChatMessage,
  type IMessagePage,
} from "@/api/chats";
import { TinyLoader } from "../General/Loader/TinyLoader";
import Composer from "./Composer";
import MessageBubble from "./MessageBubble";
import SystemCard from "./SystemCard";
import { groupByDay } from "./chatFormat";

/** Two consecutive messages from the same person within this gap read as one turn. */
const GROUP_WINDOW_MS = 2 * 60 * 1000;
/** How far off the bottom counts as "the reader has scrolled up". */
const STICK_THRESHOLD_PX = 120;

interface Props {
  conversationId: string;
  meId: number;
  isDesktop: boolean;
  typingFrom: number | null;
  onBack?: () => void;
}

function ChatThread({ conversationId, meId, isDesktop, typingFrom, onBack }: Props) {
  const queryClient = useQueryClient();
  const scroller = useRef<HTMLDivElement | null>(null);
  const stickToBottom = useRef(true);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  });

  const { data: page, isLoading } = useQuery<IMessagePage>({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId, { take: 50 }),
    enabled: !!conversationId,
  });

  const messages = page?.items ?? [];
  const lastId = messages.length ? messages[messages.length - 1].id : undefined;

  // Opening a thread is reading it. Re-runs as new messages land while the
  // thread is open, which is what stops the badge counting what is on screen.
  useEffect(() => {
    if (!conversationId || !lastId) return;
    markConversationRead(conversationId, lastId).then(() => {
      queryClient.setQueryData(["chat-unread"], (current: number | undefined) => {
        const mine =
          queryClient
            .getQueryData<any>(["conversations", "all"])
            ?.items?.find((row: any) => row.id === conversationId)?.unread_count ?? 0;
        return Math.max(0, (current ?? 0) - mine);
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [conversationId, lastId, queryClient]);

  // Before the browser paints, so a new message never appears mid-scroll.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      setHasNewBelow(false);
    } else if (messages.length) {
      setHasNewBelow(true);
    }
  }, [messages.length]);

  const handleScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < STICK_THRESHOLD_PX;
    if (stickToBottom.current) setHasNewBelow(false);
  };

  const jumpToBottom = () => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    stickToBottom.current = true;
    setHasNewBelow(false);
  };

  const send = useMutation({
    mutationFn: (vars: { body: string; nonce: string }) =>
      sendChatMessage(conversationId, { body: vars.body, client_nonce: vars.nonce }),

    // The message appears immediately, marked as in flight. The nonce is what
    // makes that safe: if this request is retried, the backend returns the
    // message it already stored rather than a second copy.
    onMutate: async (vars) => {
      stickToBottom.current = true;
      const optimistic: IChatMessage = {
        id: -Date.now(),
        type: "TEXT",
        body: vars.body,
        meta: null,
        deleted: false,
        sender_id: meId,
        sender_role: null,
        sender_name: null,
        sender_avatar: null,
        attachment_url: null,
        attachment_name: null,
        attachment_size: null,
        client_nonce: vars.nonce,
        created_at: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => ({
        items: [...(current?.items ?? []), optimistic],
        has_more: current?.has_more ?? false,
        next_before: current?.next_before ?? null,
      }));
    },

    onSuccess: (saved, vars) => {
      if (!saved) return;
      queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => ({
        items: (current?.items ?? []).map((m) => (m.client_nonce === vars.nonce ? saved : m)),
        has_more: current?.has_more ?? false,
        next_before: current?.next_before ?? null,
      }));
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },

    onError: (_error, vars) => {
      queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => ({
        items: (current?.items ?? []).map((m) =>
          m.client_nonce === vars.nonce ? { ...m, pending: false, failed: true } : m
        ),
        has_more: current?.has_more ?? false,
        next_before: current?.next_before ?? null,
      }));
    },
  });

  const retry = (message: IChatMessage) => {
    queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => ({
      items: (current?.items ?? []).filter((m) => m.client_nonce !== message.client_nonce),
      has_more: current?.has_more ?? false,
      next_before: current?.next_before ?? null,
    }));
    // A fresh nonce: the previous attempt may in fact have landed, and the
    // unique index would then hand back the stored copy rather than resending.
    send.mutate({ body: message.body, nonce: message.client_nonce || newNonce() });
  };

  const peer = conversation?.peer ?? null;
  const isSupport = conversation?.type === "SUPPORT";
  const title = isSupport ? "پشتیبانی لیدوماتریپ" : peer?.name || "کاربر لیدوماتریپ";

  return (
    <section aria-label="گفتگو" className="flex h-full min-h-0 flex-col bg-gray-F5F5F7">
      <header className="flex items-center gap-x-12 border-b-1 border-solid border-gray-EFEFEF bg-white px-16 py-12">
        {!isDesktop && (
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت به فهرست گفتگوها"
            className="flex h-32 w-32 shrink-0 items-center justify-center rounded-8 text-gray-6C6A7D hover:bg-gray-F5F5F7"
          >
            <i aria-hidden="true" className="icon-FlashRight text-20" />
          </button>
        )}

        <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-F5F5F7">
          {peer?.avatar ? (
            <img src={peer.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <i
              aria-hidden="true"
              className={`${isSupport ? "icon-Information" : "icon-Profile"} text-20 text-gray-B0AFBC`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-14 leading-22 font-m text-black">{title}</p>
          {conversation?.residence ? (
            <Link
              href={`/rentals/${conversation.residence.id}`}
              prefetch={false}
              className="block truncate text-12 leading-18 font-r text-gray-6C6A7D hover:text-primary-main"
            >
              {conversation.residence.name}
            </Link>
          ) : (
            conversation?.subject && (
              <p className="truncate text-12 leading-18 font-r text-gray-6C6A7D">
                {conversation.subject}
              </p>
            )
          )}
        </div>

        {conversation?.booking && (
          <span className="hidden shrink-0 rounded-8 bg-gray-F5F5F7 px-10 py-4 text-11 leading-18 font-r text-gray-6C6A7D sm:inline md:inline">
            {conversation.booking.reference}
          </span>
        )}
      </header>

      <div
        ref={scroller}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-16 py-12"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <TinyLoader />
          </div>
        ) : messages.length === 0 ? (
          <p className="mt-40 text-center text-13 leading-22 font-r text-gray-B0AFBC">
            هنوز پیامی رد و بدل نشده. اولین پیام را شما بنویسید.
          </p>
        ) : (
          // Announced politely: a screen-reader user should hear an arriving
          // message without it interrupting what they are already reading.
          <div aria-live="polite" aria-relevant="additions">
            {groupByDay(messages).map((group) => (
              <div key={group.label}>
                <div className="my-12 flex justify-center">
                  <span className="rounded-full bg-white px-12 py-4 text-11 leading-18 font-r text-gray-6C6A7D">
                    {group.label}
                  </span>
                </div>

                {group.messages.map((message, index) => {
                  if (message.type === "SYSTEM") return <SystemCard key={message.id} message={message} />;

                  const previous = group.messages[index - 1];
                  const grouped =
                    !!previous &&
                    previous.type !== "SYSTEM" &&
                    previous.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() -
                      new Date(previous.created_at).getTime() <
                      GROUP_WINDOW_MS;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isMine={message.sender_id === meId}
                      peerReadUpTo={conversation?.peer_last_read_message_id ?? null}
                      grouped={grouped}
                      onRetry={retry}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {typingFrom !== null && typingFrom !== meId && (
          <div className="mt-8 flex justify-end">
            <span className="flex items-center gap-x-4 rounded-16 rounded-br-4 border-1 border-solid border-gray-EFEFEF bg-white px-12 py-8">
              <span className="sr-only">در حال نوشتن</span>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  aria-hidden="true"
                  className="h-6 w-6 animate-bounce rounded-full bg-gray-B0AFBC"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {hasNewBelow && (
        <button
          type="button"
          onClick={jumpToBottom}
          className="mx-auto -mt-40 mb-8 flex items-center gap-x-6 rounded-full bg-primary-main px-14 py-6 text-12 leading-20 font-m text-white shadow-lg"
        >
          پیام جدید
          <i aria-hidden="true" className="icon-FlashDown text-14" />
        </button>
      )}

      <Composer
        isDesktop={isDesktop}
        disabled={conversation?.status === "CLOSED"}
        placeholder={
          conversation?.status === "CLOSED" ? "این گفتگو بسته شده است" : "پیام خود را بنویسید…"
        }
        onSend={(body) => send.mutate({ body, nonce: newNonce() })}
        onTyping={() => {
          void sendTyping(conversationId);
        }}
      />
    </section>
  );
}

export default ChatThread;
