import SquareSkeleton from "@/components/General/Skeletons/Square";
import { Button } from "@/components/General/core/Button";
import { IncompleteResidenceSkeleton } from "@/components/dashboard/Skeletons/IncompleteResidenceSkeleton";
import { renderPagination } from "@/utilities/Pagination";
import { useQuery } from "@tanstack/react-query";
import IncompleteResidenceCart from "components/dashboard/IncompleteResidenceCart";
import Image from "next/image";
import { useState } from "react";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";
import { IServerResidence, getResidencesList } from "@/api/Residences/getResidencesList";
const BottomActionsWrapper = dynamic(() => import("../../BottomActions/BottomActionsWrapper"), {
  ssr: true,
});

const pageSize = 5;

function Step0() {
  const [page, setPage] = useState<number>(1);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();

  const { data: residencesListData, isLoading: residencesIsLoading } = useQuery(
    ["getResidencesList"],
    () => {
      return getResidencesList();
    }
  );

  const { isLoading: getAllowedValuesIsLoading, data: allowedValuesData } = useQuery(
    ["getAllowedValues", -1],
    () => getAllowedValues({ step: -1 })
  );

  function onSubmitClick() {
    router.push(`?step=1&productId`);
  }

  return (
    <>
      <div className="pb-80 md:pb-80">
        <div className="mb-24">
          {residencesListData?.params?.residences?.filter((r: IServerResidence) => !r?.is_complete)
            .length !== 0 && (
            <p className="text-16 leading-28 text-black font-m mb-16">
              روند ثبت اقامتگاه های خود را تکمیل کنید
            </p>
          )}

          {residencesIsLoading ? (
            Array.from({ length: 3 }).map((_, i) => {
              return (
                <div key={i} className="mb-12 last:mb-0">
                  <IncompleteResidenceSkeleton />
                </div>
              );
            })
          ) : (
            <div>
              {residencesListData?.params?.residences
                ?.filter((r: IServerResidence) => !r?.is_complete && r.completion_percent !== 100)
                ?.filter((r: IServerResidence) => r.completion_percent !== 0)
                ?.slice(0, pageSize * page)
                ?.map((r: IServerResidence) => (
                  <div key={r.id} className="mb-12 last:mb-0">
                    <IncompleteResidenceCart
                      title={r.name}
                      updateDate={r.last_update_time}
                      completePercentage={r.completion_percent || 0}
                      residenceId={r.id}
                      link={`/residences/submit?step=${r.step}&productId=${r.id}`}
                      residenceImage={r.image_url}
                    />
                  </div>
                ))}

              {!!renderPagination(
                page,
                pageSize,
                residencesListData?.params?.residences
                  ?.filter((r: IServerResidence) => !r?.is_complete && r.completion_percent !== 100)
                  ?.filter((r: IServerResidence) => r.completion_percent !== 0)?.length || 0
              ) && (
                <Button
                  className="mt-24"
                  isFullWidth
                  variant="outlined"
                  color="black"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  نمایش بیشتر
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="h-[393px] w-full relative">
          {getAllowedValuesIsLoading ? (
            <SquareSkeleton
              borderRadiusClass="rounded-12"
              heightClass="h-full"
              widthClass="w-full"
            />
          ) : (
            !!allowedValuesData?.params?.image_url && (
              <Image
                src={allowedValuesData?.params?.image_url}
                alt=""
                fill
                // style={{
                //   objectFit: "cover",
                // }}
                className="rounded-12"
              />
            )
          )}
        </div>
      </div>

      <div className="w-[250px] hidden md:block sticky bottom-40 left-0 mr-auto">
        {!!isDesktop && (
          <Button isFullWidth onClick={onSubmitClick}>
            شروع ثبت اقامتگاه
          </Button>
        )}
      </div>

      <div className="md:hidden">
        {!isDesktop && (
          <BottomActionsWrapper onClickOfSubmitStep={() => onSubmitClick()}>
            <div>
              <Button isFullWidth onClick={onSubmitClick}>
                شروع ثبت اقامتگاه
              </Button>
            </div>
          </BottomActionsWrapper>
        )}
      </div>
    </>
  );
}

export default Step0;
