import { useMutation, useQuery } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { ResType } from "interfaces/Residences/Submit";
import Image from "next/image";
import { useRouter } from "next/router";
import { submitStep } from "@/api/SubmitResidence";
import StepTitle from "../../StepTitle";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";

function Step1() {
  const router = useRouter();

  const { isLoading: getAllowedValuesIsLoading, data: allowedValuesData } = useQuery(
    ["getAllowedValues", router?.query?.step],
    () => getAllowedValues({ step: Number(router?.query?.step as string) })
  );

  const submitStep1Mutation = useMutation(
    ({ resType }: { resType: ResType["name"] }) => {
      return submitStep({
        step: 1,
        data: {
          res_type: resType,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          router.push(`?step=${2}&productId=${data?.params?.product_id}`);
        }
      },
    }
  );

  return getAllowedValuesIsLoading ? (
    <TinyLoader />
  ) : (
    <>
      <StepTitle wrapperClassname="mt-16 md:mt-0 mb-24" />

      <div className="grid grid-cols-12 gap-x-10 gap-y-16">
        {(allowedValuesData?.params?.values as ResType[])?.map((el, i) => (
          <div
            className="col-span-4 md:col-span-3 cursor-pointer"
            key={el.id}
            onClick={() => submitStep1Mutation.mutate({ resType: el.name })}
          >
            <div className="w-full aspect-square relative">
              <Image
                // src={"/assets/tmp/res-0.webp"}
                src={el.image_url}
                alt={el.name}
                className="rounded-10"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
                placeholder="blur"
                blurDataURL={el.image_url}
              />
            </div>
            <p className="text-14 leading-24 text-black font-m mt-8 text-center">{el.name}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Step1;
