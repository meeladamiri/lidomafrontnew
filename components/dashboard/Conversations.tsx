import { LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";

function Conversations({ pendingConversationsN }: { pendingConversationsN: number }) {
  if (!pendingConversationsN) return null;

  return (
    <div className="py-16">
      <PageTitle
        title="گفتگوها"
        icon={<i className="icon-message text-24" />}
        containerClassname="mb-16"
      />

      <div className="flex items-center justify-between p-12 gap-x-6 rounded-10 border-1 border-solid border-gray-C4CAD3">
        <p className="text-14 leading-24 text-black">
          {pendingConversationsN} گفتگو در انتظار پاسخ شماست
        </p>
        <LinkButton href="/chats" color="secondary" className="!w-72 sm:!w-72">
          مشاهده
        </LinkButton>
      </div>
    </div>
  );
}

export default Conversations;
