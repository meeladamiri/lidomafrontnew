import Image from "next/image";
import UnHappyMessage from "../General/UnHappyMessage";
import { Button } from "../General/core/Button";
import { useRouter } from "next/router";
import { preservingURLRouteParameters } from "@/utilities/SearchPage/preservingURLRouteParameters";

function NoResidenceFound() {
  const router = useRouter();

  function clearAllFilters() {
    const { pathname } = router;
    let params = new URLSearchParams();
    params = preservingURLRouteParameters(params, router);
    router.push({ pathname, query: params.toString() }, undefined, { shallow: true });
  }

  return (
    // <div className="col-span-full">
    <UnHappyMessage
      title={`متأسفانه اقامتگاهی متناسب با
        فیلترهای شما یافت نشد !`}
      iconSrc={<Image src={"/assets/No-residance.svg"} width={210} height={166} alt="" />}
      containerClassname="pt-80"
      actions={
        <div className="flex justify-center">
          <Button
            onClick={() => {
              clearAllFilters();
            }}
            color="grey"
            rightIcon={<i className="icon-Delete text-20" />}
          >
            پاک کردن فیلترها
          </Button>
        </div>
      }
    />
    // </div>
  );
}

export default NoResidenceFound;
