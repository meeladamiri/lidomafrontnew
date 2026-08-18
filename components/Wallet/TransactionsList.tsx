import { Button } from "components/General/core/Button";
import TransactionsCart, { ITransactionsCart } from "components/Wallet/TransactionsCart";
import { useState } from "react";
import { renderPagination } from "utilities/Pagination";
import UnHappyMessage from "../General/UnHappyMessage";

const pageSize = 10;

function TransactionsList({ transactions }: { transactions: ITransactionsCart[] }) {
  const [page, setPage] = useState<number>(1);

  return (
    <>
      <div>
        {transactions.length === 0 ? (
          <UnHappyMessage
            title="هنوز تراکنشی نداری !"
            // TODO:icon will be provided by figma.
            iconSrc={"/assets/No-comment.svg"}
            containerClassname="py-20"
          />
        ) : (
          transactions.map((transaction: ITransactionsCart, index: number) => (
            <div className="mb-12 last:mb-0" key={index}>
              <TransactionsCart
                isFailed={transaction.isFailed}
                failureReason={transaction.failureReason}
                price={transaction.price}
                transferredTo={transaction.transferredTo}
                reserveCode={transaction.reserveCode}
                date={transaction.date}
              />
            </div>
          ))
        )}
      </div>

      {renderPagination(page, pageSize, transactions.length) && (
        <div className="mt-24">
          <Button
            isFullWidth
            variant="outlined"
            color="black"
            onClick={() => setPage((prev) => prev + 1)}
          >
            مشاهده نتایج بیشتر
          </Button>
        </div>
      )}
    </>
  );
}

export default TransactionsList;
