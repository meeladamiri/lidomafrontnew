import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import SuggestedResidenceCart from "../Residences/Suggest/SuggestedResidenceCart";
import {
  getAlternativeResidencesList,
  IAlternativeResidence,
  sendAlternativeResidencesList,
} from "@/api/Reserves";
import { Button } from "../General/core/Button";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import ModalWrapper from "components/General/core/ModalWrapper";

function SendAltersListModal({
  isModalOpen,
  handleClose,
  reserveId,
}: //   handleAfterSelect,
{
  isModalOpen: boolean;
  handleClose: () => void;
  reserveId: number;
  //   handleAfterSelect: () => void;
}) {
  const queryClient = useQueryClient();

  const [alternativeResidencesList, setAlternativeResidencesList] = useState<
    IAlternativeResidence[]
  >([]);
  const [selectedResidences, setSelectedResidences] = useState<IAlternativeResidence[]>([]);

  const { isLoading, isSuccess, data } = useQuery(
    ["getAlternativeResidencesList"],
    () => {
      return getAlternativeResidencesList({ reserveId });
    },
    {
      enabled: !!reserveId,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setAlternativeResidencesList(data?.params?.residences_list);
      } else {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: "مشکلی در سمت سرور رخ داد. لطفا مجددا تلاش کنید.",
          },
        ]);
      }
    }
  }, [data]);

  const sendAlternativeResidencesListMutation = useMutation(
    () => {
      return sendAlternativeResidencesList({
        reserveId,
        residencesIDs: selectedResidences.map((el) => el.id),
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          queryClient.invalidateQueries(["getReserve"]);

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "پیشنهادات شما با موفقیت ارسال شد" },
          ]);

          //   router.push("/dashboard");
          handleClose();
        }
      },
    }
  );

  return (
    <ModalWrapper
      headerTitle="پیشنهاد جایگزینی"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      // bodyContainerClassname="!pt-136 md:!pt-0"
      bodyContainerClassname="md:!pb-0"
      modalClassname="md:!w-[380px] md:max-h-[90%]"
    >
      <div className="">
        {isLoading ? (
          <TinyLoader />
        ) : (
          <>
            <div className="pb-[80px] md:pb-0">
              {alternativeResidencesList?.map((item: IAlternativeResidence, index: number) => (
                <div key={item.id} className="mb-16 last:mb-0">
                  <SuggestedResidenceCart
                    residenceCode={item.reference}
                    residenceId={item.id}
                    residenceName={item.name}
                    residenceImage={item.image_url}
                    price={item.price}
                    isSelected={!!selectedResidences.find((el) => el.id === item.id)}
                    onAdd={() => setSelectedResidences((prev) => [...prev, item])}
                    onRemove={() =>
                      setSelectedResidences((prev) => prev.filter((el) => el.id !== item.id))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="bg-white py-16 px-20 md:px-0 fixed md:sticky bottom-0 right-0 left-0 z-2">
              <p className="text-14 leading-24 text-zilgara font-r mb-16 text-center">
                {selectedResidences.length} اقامتگاه جهت پیشنهاد جایگزینی انتخاب شده است
              </p>

              <Button
                isFullWidth
                disabled={!selectedResidences.length}
                isLoading={sendAlternativeResidencesListMutation.isLoading}
                onClick={() => sendAlternativeResidencesListMutation.mutate()}
              >
                {!selectedResidences.length
                  ? "حداقل یک اقامتگاه را انتخاب کنید"
                  : "ارسال پیشنهادات جایگزینی"}
              </Button>
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}

export default SendAltersListModal;
