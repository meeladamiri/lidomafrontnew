import { Button } from "components/General/core/Button";
import Link from "next/link";

function SuggestedResidenceCart({
  residenceId,
  residenceName,
  residenceCode,
  residenceImage,
  price,
  isSelected,
  onAdd,
  onRemove,
}: {
  residenceId: number;
  residenceName: string;
  residenceCode: string;
  residenceImage: string;
  price: number;
  isSelected: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div
        className="w-full h-[214px] p-12 relative rounded-tr-16 rounded-tl-16"
        style={{
          // background: `url('${residenceImage}')`,
          background: `url('/assets/tmp/residence-1.webp')`,
          objectFit: "cover",
        }}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-end">
              <Link
                passHref
                prefetch={false}
                href={`/residences/${residenceId}/details`}
                className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
              >
                <i className="icon-See text-18" />
                <span className="text-12 leading-21">مشاهده</span>
              </Link>
            </div>
          </div>

          <div className="z-2">
            <div className="flex items-center justify-between gap-x-8">
              <div className="text-14 leading-24 text-white OnlyOneLineAndEndWithElipsis">
                {residenceName}
              </div>
              <div className="shrink-0 flex justify-end">
                <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                  کد اقامتگاه : {residenceCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* that faded black layer on image  */}
        <div
          className="h-[107px] absolute w-full bottom-0 right-0"
          style={{
            background:
              "linear-gradient(0deg, #000000 7%, rgba(0, 0, 0, 0.52) 49.82%, rgba(0, 0, 0, 0.0001) 80.84%)",
          }}
        />
      </div>

      <div className="p-12 border-1 border-solid border-[#1C345442] border-t-none rounded-br-12 rounded-bl-12">
        <p className="mb-16 text-16 leading-28 font-m text-black">
          قیمت هر شب از : {price.toLocaleString("en-US")} تومان
        </p>

        {!!isSelected ? (
          <Button color="error" isFullWidth variant="outlined" onClick={onRemove}>
            حذف کردن از لیست پیشنهادات
          </Button>
        ) : (
          <Button color="secondary" isFullWidth onClick={onAdd}>
            افزودن به پیشنهادات
          </Button>
        )}
      </div>
    </div>
  );
}
export default SuggestedResidenceCart;
