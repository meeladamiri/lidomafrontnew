import { useMutation, useQuery } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ResRegion } from "interfaces/Residences/Submit";
import Image from "next/image";
import { useRouter } from "next/router";
import exception from "utilities/exception";
import { submitStep } from "@/api/SubmitResidence";
import StepTitle from "../../StepTitle";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";

function Step2() {
  const router = useRouter();

  const { isLoading: getAllowedValuesIsLoading, data: allowedValuesData } = useQuery(
    ["getAllowedValues", router?.query?.step],
    () => getAllowedValues({ step: Number(router?.query?.step as string) })
  );

  const submitStep2Mutation = useMutation(
    ({ resRegion }: { resRegion: ResRegion["name"] }) => {
      return submitStep({
        step: 2,
        productId: Number(router?.query?.productId as string),
        data: {
          res_region: resRegion,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          router.push(`?step=${3}&productId=${router?.query?.productId}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: defaultError }]);
        }
      },
    }
  );

  return getAllowedValuesIsLoading ? (
    <TinyLoader />
  ) : (
    <>
      <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

      <div className="grid grid-cols-12 gap-x-16 gap-y-16">
        {(allowedValuesData?.params?.values as ResRegion[])?.map((el, i) => (
          <div
            className="col-span-6 md:col-span-4 cursor-pointer"
            key={el.id}
            onClick={() => submitStep2Mutation.mutate({ resRegion: el.name })}
          >
            <div className="w-full aspect-square relative">
              <Image
                // src={"/assets/tmp/res-0.webp"}
                src={el.image_url}
                alt=""
                className="rounded-10"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <p className="text-14 leading-24 text-black font-m mt-8 text-center">{el.name}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Step2;
