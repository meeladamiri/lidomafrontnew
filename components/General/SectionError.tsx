import { Button } from "components/General/core/Button";
import UnHappyMessage from "components/General/UnHappyMessage";

/**
 * A list that could not be loaded.
 *
 * Until now these pages destructured only `isLoading` and `data`, so a failed
 * request looked exactly like having nothing: the reservations page rendered
 * its title, its tabs with no counts, and then nothing at all — no message, no
 * explanation, and no way back except reloading the whole page. Worse where an
 * empty state did show, because "سفری ثبت نشده" is a claim about the account,
 * and the request had simply failed.
 *
 * Built on `UnHappyMessage` rather than beside it: same icon, spacing and
 * heading as every other end-state in the panel, so this reads as part of the
 * page instead of as an error screen bolted on. Section-level on purpose —
 * the header, the tabs and the navigation stay usable while one part retries.
 */
export function SectionError({
  title = "اطلاعات بارگذاری نشد",
  subTitle = "ارتباط برقرار نشد. دوباره تلاش کنید.",
  onRetry,
  isRetrying,
}: {
  title?: string;
  subTitle?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <UnHappyMessage
      iconSrc={<i aria-hidden="true" className="icon-Warning text-56 text-warning" />}
      title={title}
      subTitle={subTitle}
      containerClassname="py-40"
      actions={
        <div className="flex justify-center">
          <Button
            variant="outlined"
            color="black"
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="در حال تلاش…"
            rightIcon={<i aria-hidden="true" className="icon-Refresh text-20" />}
          >
            تلاش دوباره
          </Button>
        </div>
      }
    />
  );
}

export default SectionError;
