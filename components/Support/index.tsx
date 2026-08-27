import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createSupportConversation,
  getConversations,
  type IMessagePage,
} from "@/api/chats";
import { useUserProfile } from "@/providers/Profile";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useChatStream, type ChatStreamEvent } from "@/utilities/useChatStream";
import PageTitle from "components/General/PageTitle";
import { TinyLoader } from "../General/Loader/TinyLoader";
import ChatThread from "../Chats/ChatThread";
import ConversationList from "../Chats/ConversationList";

/**
 * Support.
 *
 * The same thread UI as /chats, narrowed to SUPPORT conversations, plus the
 * form that opens one. Users do not distinguish "a chat with my host" from "a
 * chat with the site" in how they expect it to behave, so making the second
 * one work differently would only be a second thing to learn.
 *
 * A ticket is a conversation like any other: the reply arrives live, the
 * unread badge counts it, and there is no separate inbox to remember.
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

function Support() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useUserProfile();
  const meId = profile?.id ?? 0;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [body, setBody] = useState("");
  const [polling, setPolling] = useState(false);

  const selectedId = typeof router.query.c === "string" ? router.query.c : null;

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
  // making someone find a button to reach the only thing this page does.
  useEffect(() => {
    if (!isLoading && items.length === 0 && !selectedId) setComposing(true);
  }, [isLoading, items.length, selectedId]);

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
      <PageTitle
        title="پشتیبانی"
        icon={<i aria-hidden="true" className="icon-Information text-24" />}
        containerClassname="mb-16"
      />

      <div className="grid h-[calc(100vh-240px)] min-h-[460px] grid-cols-1 overflow-hidden rounded-16 border-1 border-solid border-gray-EFEFEF bg-white md:h-[calc(100vh-260px)] md:grid-cols-[360px_1fr]">
        {showList && (
          <div className="flex min-h-0 flex-col border-l-0 border-solid border-gray-EFEFEF md:border-l-1">
            <div className="border-b-1 border-solid border-gray-EFEFEF p-12">
              <button
                type="button"
                onClick={() => {
                  setComposing(true);
                  select(null);
                }}
                className="flex w-full items-center justify-center gap-x-6 rounded-12 bg-primary-main px-16 py-10 text-13 leading-22 font-m text-white transition-opacity hover:opacity-90"
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
                <ConversationList items={items} selectedId={selectedId} onSelect={(id) => {
                  setComposing(false);
                  select(id);
                }} />
              )}
            </div>
          </div>
        )}

        {composing ? (
          <section aria-label="پیام جدید به پشتیبانی" className="min-h-0 overflow-y-auto bg-gray-F5F5F7 p-16 md:p-24">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (body.trim().length < 2 || create.isLoading) return;
                create.mutate();
              }}
              className="mx-auto max-w-[560px] rounded-16 border-1 border-solid border-gray-EFEFEF bg-white p-16 md:p-24"
            >
              <h2 className="text-16 leading-26 font-m text-black">پشتیبانی چطور می‌تواند کمک کند؟</h2>
              <p className="mt-4 text-12 leading-20 font-r text-gray-6C6A7D">
                پاسخ همین‌جا و در همین صفحه به شما نمایش داده می‌شود.
              </p>

              <label htmlFor="support-subject" className="mt-16 block text-13 leading-22 font-m text-black">
                موضوع
              </label>
              <select
                id="support-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-6 w-full rounded-12 border-1 border-solid border-gray-EFEFEF bg-white px-12 py-10 text-14 leading-24 font-r text-black outline-none focus:border-primary-main"
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
                className="mt-6 w-full resize-y rounded-12 border-1 border-solid border-gray-EFEFEF bg-gray-F5F5F7 px-12 py-10 text-14 leading-24 font-r text-black outline-none transition-colors placeholder:text-gray-B0AFBC focus:border-primary-main focus:bg-white"
              />

              <div className="mt-16 flex items-center gap-x-8">
                <button
                  type="submit"
                  disabled={body.trim().length < 2 || create.isLoading}
                  className="rounded-12 bg-primary-main px-20 py-10 text-13 leading-22 font-m text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {create.isLoading ? "در حال ارسال…" : "ارسال پیام"}
                </button>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    className="rounded-12 px-16 py-10 text-13 leading-22 font-r text-gray-6C6A7D hover:bg-gray-F5F5F7"
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
            <div className="flex flex-col items-center justify-center bg-gray-F5F5F7 px-24 text-center">
              <i aria-hidden="true" className="icon-Information text-40 text-gray-CACFD3" />
              <p className="mt-12 text-14 leading-24 font-m text-black">
                یکی از پیام‌ها را انتخاب کنید
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Support;
