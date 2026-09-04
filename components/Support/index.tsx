import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createSupportConversation, getConversations, type IMessagePage } from "@/api/chats";
import { useUserProfile } from "@/providers/Profile";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useChatStream, type ChatStreamEvent } from "@/utilities/useChatStream";
import PageTitle from "components/General/PageTitle";
import Tabs from "components/General/core/Tabs";
import { TinyLoader } from "../General/Loader/TinyLoader";
import ChatThread from "../Chats/ChatThread";
import ConversationList from "../Chats/ConversationList";
import { SupportPageFAQs } from "./SupportPageFAQs";
import CallSupport from "./CallSupport";

/**
 * Support: سوالات متداول، تماس با ما، چت با پشتیبانی — three concerns a
 * person reaches for at different moments, so they are three tabs rather
 * than one long scroll mixing an accordion, a phone number, and a live
 * thread. Only the chat tab keeps state across a tab switch (the open
 * conversation, in the URL) — the other two are stateless reads.
 *
 * The chat tab's mechanics (live stream, optimistic send, the compose-a-
 * ticket form) are unchanged from before this redesign — only restyled to
 * match the other two tabs.
 */

const FALLBACK_POLL_MS = 15_000;

const SUBJECTS = [
  "مشکل در پرداخت",
  "مشکل در رزرو",
  "لغو و بازپرداخت",
  "گزارش تخلف",
  "سؤال درباره اقامتگاه",
  "موارد دیگر",
];

type Tab = "faq" | "call" | "chat";
const TABS: { key: Tab; label: string }[] = [
  { key: "chat", label: "چت با پشتیبانی" },
  { key: "faq", label: "سوالات متداول" },
  { key: "call", label: "تماس با ما" },
];

function Support() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useUserProfile();
  const meId = profile?.id ?? 0;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [tab, setTab] = useState<Tab>("chat");
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [body, setBody] = useState("");
  const [polling, setPolling] = useState(false);

  const selectedId = typeof router.query.c === "string" ? router.query.c : null;

  // A conversation link (from a notification, e.g.) should open straight
  // into the chat tab rather than landing on سوالات متداول with the thread
  // loaded silently behind it.
  useEffect(() => {
    if (selectedId) setTab("chat");
  }, [selectedId]);

  const select = useCallback(
    (id: string | null) => {
      const query = { ...router.query };
      if (id) query.c = id;
      else delete query.c;
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", "support"],
    queryFn: () => getConversations({ type: "SUPPORT", take: 50 }),
    refetchInterval: polling ? FALLBACK_POLL_MS : false,
    enabled: tab === "chat",
  });

  const items = data?.items ?? [];

  const handleEvent = useCallback(
    (event: ChatStreamEvent) => {
      const conversationId = event.data?.conversation_id;
      if (!conversationId || event.type !== "message") return;

      queryClient.setQueryData<IMessagePage>(["messages", conversationId], (current) => {
        if (!current) return current;
        const message = event.data.message;
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
      queryClient.invalidateQueries({ queryKey: ["chat-unread"] });
    },
    [queryClient]
  );

  useChatStream(!!meId, handleEvent, setPolling);

  // Nothing to show and nothing selected: go straight to the form rather than
  // making someone find a button to reach the only thing this tab does.
  useEffect(() => {
    if (tab === "chat" && !isLoading && items.length === 0 && !selectedId) setComposing(true);
  }, [tab, isLoading, items.length, selectedId]);

  const create = useMutation({
    mutationFn: () => createSupportConversation({ subject, body: body.trim() }),
    onSuccess: (id) => {
      if (!id) {
        toast.error("ارسال پیام ممکن نشد. دوباره تلاش کنید.");
        return;
      }
      setBody("");
      setComposing(false);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      select(id);
    },
    onError: () => toast.error("ارسال پیام ممکن نشد. دوباره تلاش کنید."),
  });

  const showThread = !!selectedId && !composing;
  const showList = isDesktop || (!showThread && !composing);

  return (
    <div className="pb-40 md:pb-0">
      <div className="px-16 md:px-0">
        <PageTitle
          title="پشتیبانی"
          icon={<i aria-hidden="true" className="icon-OnlineContact text-24" />}
          containerClassname="mb-16"
        />
      </div>

      <div className="mb-16 px-16 md:px-0">
        <Tabs
          activeIndex={TABS.findIndex((t) => t.key === tab)}
          onChange={(index: number) => setTab(TABS[index].key)}
          data={TABS.map((t, tabIndex) => ({ tabLabel: t.label, tabIndex }))}
        />
      </div>

      {tab === "faq" && (
        <div className="rounded-24 bg-white px-16 py-20 md:border-1 md:border-solid md:border-gray-F0F0F0 md:p-24 md:shadow-[0_1px_3px_rgba(24,39,58,0.05)]">
          <SupportPageFAQs role={profile?.is_host ? "host" : "guest"} />
        </div>
      )}

      {tab === "call" && (
        <div className="rounded-24 bg-white px-16 py-24 md:border-1 md:border-solid md:border-gray-F0F0F0 md:shadow-[0_1px_3px_rgba(24,39,58,0.05)]">
          <CallSupport />
        </div>
      )}

      {tab === "chat" && (
        <div className="grid h-[calc(100dvh-260px)] min-h-[420px] grid-cols-1 overflow-hidden bg-white md:h-[calc(100vh-300px)] md:rounded-24 md:border-1 md:border-solid md:border-gray-F0F0F0 md:shadow-[0_1px_3px_rgba(24,39,58,0.05)] md:grid-cols-[360px_1fr]">
          {showList && (
            <div className="flex min-h-0 flex-col border-t-1 border-solid border-gray-F0F0F0 md:border-t-0 md:border-l-1">
              <div className="p-12">
                <button
                  type="button"
                  onClick={() => {
                    setComposing(true);
                    select(null);
                  }}
                  className="flex w-full items-center justify-center gap-x-6 rounded-14 bg-primary-main px-16 py-11 text-13 leading-22 font-b text-black transition-opacity hover:opacity-90"
                >
                  <i aria-hidden="true" className="icon-Plus text-16" />
                  پیام جدید به پشتیبانی
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <TinyLoader />
                  </div>
                ) : (
                  <ConversationList
                    items={items}
                    selectedId={selectedId}
                    onSelect={(id) => {
                      setComposing(false);
                      select(id);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {composing ? (
            <section
              aria-label="پیام جدید به پشتیبانی"
              className="min-h-0 overflow-y-auto bg-gray-F8F8F8 p-16 md:p-24"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (body.trim().length < 2 || create.isLoading) return;
                  create.mutate();
                }}
                className="mx-auto max-w-[560px] rounded-24 bg-white p-16 shadow-[0_1px_3px_rgba(24,39,58,0.05)] md:p-24"
              >
                <h2 className="text-16 leading-26 font-b text-black">پشتیبانی چطور می‌تواند کمک کند؟</h2>
                <p className="mt-4 text-12 leading-20 font-r text-gray-77828F">
                  پاسخ همین‌جا و در همین صفحه به شما نمایش داده می‌شود.
                </p>

                <label htmlFor="support-subject" className="mt-20 block text-13 leading-22 font-m text-black">
                  موضوع
                </label>
                <select
                  id="support-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-6 w-full rounded-14 border-1 border-solid border-gray-F0F0F0 bg-white px-14 py-11 text-14 leading-24 font-r text-black outline-none focus:border-primary-main"
                >
                  {SUBJECTS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <label htmlFor="support-body" className="mt-16 block text-13 leading-22 font-m text-black">
                  شرح پیام
                </label>
                <textarea
                  id="support-body"
                  rows={6}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="هرچه دقیق‌تر بنویسید، سریع‌تر می‌توانیم کمک کنیم. اگر به رزرو مشخصی مربوط است، شماره پیگیری را هم بنویسید."
                  className="mt-6 w-full resize-y rounded-14 border-1 border-solid border-transparent bg-gray-F8F8F8 px-14 py-11 text-14 leading-24 font-r text-black outline-none transition-colors placeholder:text-gray-A9B1BC focus:border-primary-main focus:bg-white"
                />

                <div className="mt-18 flex items-center gap-x-8">
                  <button
                    type="submit"
                    disabled={body.trim().length < 2 || create.isLoading}
                    className="rounded-14 bg-primary-main px-22 py-11 text-13 leading-22 font-b text-black shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    {create.isLoading ? "در حال ارسال…" : "ارسال پیام"}
                  </button>

                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="rounded-14 px-16 py-11 text-13 leading-22 font-r text-gray-77828F hover:bg-white"
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </section>
          ) : showThread ? (
            <ChatThread
              key={selectedId}
              conversationId={selectedId as string}
              meId={meId}
              isDesktop={isDesktop}
              typingFrom={null}
              onBack={() => select(null)}
            />
          ) : (
            isDesktop && (
              <div className="flex flex-col items-center justify-center bg-gray-F8F8F8 px-24 text-center">
                <span className="flex h-72 w-72 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(24,39,58,0.06)]">
                  <i aria-hidden="true" className="icon-Information text-32 text-primary-main" />
                </span>
                <p className="mt-16 text-15 leading-24 font-b text-black">یکی از پیام‌ها را انتخاب کنید</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Support;
