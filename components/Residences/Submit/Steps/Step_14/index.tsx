import { useState } from "react";
import { sanitize } from "isomorphic-dompurify";
import { Checkbox } from "@/components/General/core/Checkbox";
import { LIDOMA_RULES } from "@/constants/LIDOMA_RULES";
import StepTitle from "../../StepTitle";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { Button } from "@/components/General/core/Button";

function Step14() {
  const [hasReadRulesAndAgree, setHasReadRulesAndAgree] = useState<boolean>(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const submitStep14Mutation = useMutation(
    ({ productId }: { productId: number }) => {
      return submitStep({
        step: 14,
        productId,
        data: {},
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          queryClient.invalidateQueries([
            "getResidencesList",
            "getDashboardData", // bcz we have none-confirmed completed residences in '/dashboard'  page.
          ]);

          exception.message([
            {
              type: EXCEPTIONTYPES.SUCCESS,
              title: "روند ثبت اقامتگاه مورد نظر با موفقیت کامل شد.",
            },
          ]);
          router.push("/dashboard");
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep14Mutation.mutate({
      productId: Number(router?.query?.productId as string),
    });
  }

  return (
    <>
      <div className="pb-80 md:pb-80">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0 hidden md:flex" />

        <div
          className="p-10 rounded-10 text-14 leading-24 text-[rgba(28,46,69,0.6)] mt-16 md:mt-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(25, 59, 103, 0.05), rgba(25, 59, 103, 0.05)), #FFFFFF",
          }}
        >
          {/* <h2 className="font-b mb-32">قوانین عمومی</h2> */}
          <p
            dangerouslySetInnerHTML={{ __html: sanitize(LIDOMA_RULES) }}
            className="overflow-y-auto max-h-[calc(100vh-240px)] md:max-h-[396px]"
          ></p>
        </div>

        <div className="mt-24 flex items-center gap-x-8">
          <Checkbox
            onChange={(e) => {
              setHasReadRulesAndAgree(e.target.checked);
            }}
            disabled={false}
            label={"قوانین را مطالعه کرده ام و آن را تأیید میکنم"}
            checked={hasReadRulesAndAgree}
          />
        </div>
      </div>

      <BottomActionsWrapper
        onClickOfSubmitStep={() => onSubmitClick()}
        isSubmitBtnDisabled={!hasReadRulesAndAgree}
      >
        <Button
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          isFullWidth
          onClick={onSubmitClick}
          disabled={!hasReadRulesAndAgree}
        >
          ثبت نهایی اقامتگاه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step14;
