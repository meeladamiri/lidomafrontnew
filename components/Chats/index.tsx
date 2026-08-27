import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations, type IConversationRow, type IMessagePage } from "@/api/chats";
import { useUserProfile } from "@/providers/Profile";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useChatStream, type ChatStreamEvent } from "@/utilities/useChatStream";
import PageTitle from "components/General/PageTitle";
import Tabs from "components/General/core/Tabs";
import { TinyLoader } from "../General/Loader/TinyLoader";
import ChatThread from "./ChatThread";
import ConversationList from "./ConversationList";

/**
 * The conversations page.
 *
 * Two panes on a desktop, one at a time on a phone. The selected thread lives
 * in the query string (`?c=`) rather than component state, which is what makes
 * the link in the notification SMS open straight into the right conversation,
 * and lets the browser's back button do what it looks like it should.
 *
 * The live stream is opened once, here, and its events are written into the
 * react-query cache. Both panes read from that cache, so an arriving message
 * updates the thread and reorders the list without either of them knowing the
 * stream exists.
 */

/** Only while the stream is unavailable — see useChatStream. */
const FALLBACK_POLL_MS = 15_000;
/** The indicator is a hint, not a state to get stuck in. */
const TYPING_TIMEOUT_MS = 4000;

type TabKey = "all" | "archived";

function Chats() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useUserProfile();
  const meId = profile?.id ?? 0;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [tab, setTab] = useState<TabKey>("all");
  const [polling, setPolling] = useState(false);
  const [typing, setTyping] = useState<{ conversationId: string; userId: number } | null>(null);

  const selectedId = typeof router.query.c === "string" ? router.query.c : null;

  const select = useCallback(
    (id: string | null) => {
      const query = { ...router.query };
      if (id) query.c = id;
      else delete query.c;
      // Shallow: this is a pane change, not a page change. A real navigation
      // would throw away the loaded messages and reopen the stream.
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", tab],
    queryFn: () => getConversations({ archived: tab === "archived", take: 50 }),
    refetchInterval: polling ? FALLBACK_POLL_MS : false,
  });

  const items: IConversationRow[] = useMemo(() => data?.items ?? [], [data]);

  // --- live updates -------------------------------------------------------

  const handleEvent = useCallback(
    (event: ChatStreamEvent) => {
      const conversationId = event.data?.conversation_id;
      if (!conversationId) return;

      if (event.type === "message") {
        const message = event.data.message;

        queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => {
          if (!current) return current;
          // The sender receives their own message back through the stream, and
          // it is already on screen as the optimistic copy. Match on id and on
          // nonce so neither path duplicates it.
          const seen = current.items.some(
            (m) => m.id === message.id || (!!m.client_nonce && m.client_nonce === message.client_nonce)
          );
          if (seen) {
            return {
              ...current,
              items: current.items.map((m) =>
                m.client_nonce && m.client_nonce === message.client_nonce ? message : m
              ),
            };
          }
          return { ...current, items: [...current.items, message] };
        });

        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if (message.sender_id !== meId) {
          queryClient.invalidateQueries({ queryKey: ["chat-unread"] });
        }
        return;
      }

      if (event.type === "read") {
        queryClient.setQueryData(["conversation", conversationId], (current: any) =>
          current && event.data.reader_id !== meId
            ? { ...current, peer_last_read_message_id: event.data.last_read_message_id }
            : current
        );
        return;
      }

      if (event.type === "typing") {
        setTyping({ conversationId, userId: event.data.user_id });
        return;
      }

      if (event.type === "message-deleted") {
        queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) =>
          current
            ? {
                ...current,
                items: current.items.map((m) =>
                  m.id === event.data.message_id ? { ...m, deleted: true, body: "" } : m
                ),
              }
            : current
        );
      }
    },
    [meId, queryClient]
  );

  useChatStream(!!meId, handleEvent, setPolling);

  // The indicator clears itself; there is no "stopped typing" event, and a
  // dot animation that never stops is worse than none.
  useEffect(() => {
    if (!typing) return;
    const timer = setTimeout(() => setTyping(null), TYPING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [typing]);

  // --- render -------------------------------------------------------------

  const showThread = !!selectedId;
  const showList = isDesktop || !showThread;

  return (
    <div className="pb-40 md:pb-0">
      <PageTitle
        title="گفتگو ها"
        icon={<i aria-hidden="true" className="icon-message text-24" />}
        containerClassname="mb-16"
      />

      {showList && (
        <div className="mb-16 w-full md:w-[360px]">
          <Tabs
            activeIndex={tab === "all" ? 0 : 1}
            onChange={(index: number) => setTab(index === 0 ? "all" : "archived")}
            data={[
              { tabLabel: "جاری", tabIndex: 0 },
              { tabLabel: "پایان یافته", tabIndex: 1 },
            ]}
          />
        </div>
      )}

      <div className="grid h-[calc(100vh-260px)] min-h-[460px] grid-cols-1 overflow-hidden rounded-16 border-1 border-solid border-gray-EFEFEF bg-white md:h-[calc(100vh-280px)] md:grid-cols-[360px_1fr]">
        {showList && (
          <div className="min-h-0 overflow-y-auto border-l-0 border-solid border-gray-EFEFEF md:border-l-1">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <TinyLoader />
              </div>
            ) : (
              <ConversationList items={items} selectedId={selectedId} onSelect={select} />
            )}
          </div>
        )}

        {showThread ? (
          <ChatThread
            key={selectedId}
            conversationId={selectedId as string}
            meId={meId}
            isDesktop={isDesktop}
            typingFrom={typing?.conversationId === selectedId ? typing.userId : null}
            onBack={() => select(null)}
          />
        ) : (
          isDesktop && (
            <div className="flex flex-col items-center justify-center bg-gray-F5F5F7 px-24 text-center">
              <i aria-hidden="true" className="icon-message text-40 text-gray-CACFD3" />
              <p className="mt-12 text-14 leading-24 font-m text-black">
                یک گفتگو را از فهرست انتخاب کنید
              </p>
              <p className="mt-4 text-12 leading-20 font-r text-gray-6C6A7D">
                پیام‌های شما با میزبان‌ها و پشتیبانی همین‌جا جمع می‌شود.
              </p>
            </div>
          )
        )}
      </div>

      {polling && (
        <p className="mt-8 text-center text-11 leading-18 font-r text-gray-B0AFBC">
          اتصال زنده برقرار نشد؛ پیام‌ها هر چند ثانیه به‌روز می‌شوند.
        </p>
      )}
    </div>
  );
}

export default Chats;
