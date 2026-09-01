import { Button } from "components/General/core/Button";
import Image from "next/image";

import { useRouter } from "next/router";
import { isContactOpen, INVOICE_WINDOW_NOTE } from "@/utilities/tripWindow";

const pageStyle = `
@page {
  size: A4;
  margin: 0;
  padding: 0;
}
`;

/**
 * The invoice is available for the same window as contact: until the day
 * after checkout. It says so up front rather than letting somebody find out
 * by pressing a button that has quietly stopped working.
 */
function DownloadFactor({ reserveId, endDate }: { reserveId: number; endDate?: string }) {
  const router = useRouter();
  const open = isContactOpen(endDate);

  return (
    <>
      {/* <div style={{ display: "none" }} className="element-to-print">
        <Factor ref={(el: any) => (componentRef.current = el)} />
      </div> */}

      <div className="p-12 bg-black rounded-8 flex items-center justify-between gap-x-10">
        <div className="min-w-0">
          <p className="text-16 font-m text-white">دریافت فاکتور رزرو</p>
          <p className="text-12 leading-20 text-white/70 mt-2">{INVOICE_WINDOW_NOTE}</p>
        </div>
        <Button
          disabled={!open}
          color="warning"
          rightIcon={
            <Image
              src="/assets/download.svg"
              width={12}
              height={16}
              alt="دانلود"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          }
          className="!text-black"
          onClick={() => router.push(`/factor/${reserveId}`)}
        >
          دانلود
        </Button>
      </div>

      {/* <ReactToPrint
        trigger={() => (
       
        )}
        content={() => componentRef.current}
        pageStyle={pageStyle}
        // fonts={[
        //   { family: "IRANYekan-regular-FN", source: "/public/fonts/IRANYekanRegularFaNum.ttf" },
        //   { family: "IRANYekan-medium-FN", source: "/public/fonts/IRANYekanMediumFaNum.ttf" },
        //   { family: "IRANYekan-bold-FN", source: "/public/fonts/IRANYekanBoldFaNum.ttf" },
        //   { family: "IRANYekan-regular", source: "/public/fonts/IRANYekanRegular.ttf" },
        //   { family: "IRANYekan-medium", source: "/public/fonts/IRANYekanMedium.ttf" },
        //   { family: "IRANYekan-bold", source: "/public/fonts/IRANYekanBold.ttf" },
        // ]}
      /> */}
    </>
  );
}

export default DownloadFactor;
