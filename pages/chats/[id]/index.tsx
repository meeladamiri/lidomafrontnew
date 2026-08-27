import type { GetServerSideProps, NextPage } from "next";

/**
 * The old per-chat page.
 *
 * A thread is no longer its own route — it is a pane on /chats, selected with
 * `?c=`, so that choosing one does not throw away the loaded messages and the
 * open stream. This redirect keeps anything still pointing at the old shape
 * working: an old bookmark, a link in a message someone saved.
 *
 * 307 rather than 301: the shape may well change again, and this is behind
 * auth, so there is nothing here a crawler should be caching either way.
 */
const ChatRedirectPage: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  return {
    redirect: {
      destination: id ? `/chats?c=${encodeURIComponent(id)}` : "/chats",
      permanent: false,
    },
  };
};

export default ChatRedirectPage;
