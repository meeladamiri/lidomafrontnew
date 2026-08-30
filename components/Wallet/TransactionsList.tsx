import { useInfiniteQuery } from "@tanstack/react-query";
import { getWalletTransactions } from "@/api/Wallet";
import { Button } from "components/General/core/Button";
import TransactionsCart from "components/Wallet/TransactionsCart";
import UnHappyMessage from "../General/UnHappyMessage";
import { TinyLoader } from "../General/Loader/TinyLoader";

/**
 * The statement.
 *
 * Paged from the server by cursor. The old version received every transaction
 * in the wallet payload and paged them in memory — fine for a new account,
 * increasingly not for a host who has been letting a place for two years.
 */
function TransactionsList() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["walletTransactions"],
    queryFn: ({ pageParam }) =>
      getWalletTransactions({ cursor: pageParam as number | undefined, take: 20 }),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) return <TinyLoader />;

  if (items.length === 0) {
    return (
      <UnHappyMessage
        title="هنوز تراکنشی نداشته‌اید"
        iconSrc="/assets/No-comment.svg"
        containerClassname="py-20"
      />
    );
  }

  return (
    <>
      <div>
        {items.map((transaction) => (
          <div className="mb-12 last:mb-0" key={transaction.id}>
            <TransactionsCart transaction={transaction} />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-24">
          <Button
            isFullWidth
            variant="outlined"
            color="black"
            isLoading={isFetchingNextPage}
            loadingText="در حال دریافت"
            onClick={() => fetchNextPage()}
          >
            مشاهده بیشتر
          </Button>
        </div>
      )}
    </>
  );
}

export default TransactionsList;
