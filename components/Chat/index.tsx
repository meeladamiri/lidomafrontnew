import { getSingleChatMessages, ISingleChatDetails, submitChatMessage } from "@/api/chats";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { useUserProfile } from "@/providers/Profile";

import exception from "@/utilities/exception";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LinkButton } from "components/General/core/Button";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import SubmitChatMessageArea from "./SubmitChatMessageArea";
import ChatMessagesSection from "./ChatMessagesSection";

const yupSchema = {
  messageTextInput: Yup.string(),
  // .test(
  //   `تبادل شماره تماس تا قبل از قطعی شدن رزرو، خلاف قوانین سایت می باشد و در صورت انجام این کار ، حساب کاربری شما مسدود خواهد شد.`,
  //   (value) => !/\d{4,}/.test(value || "")
  // ),
};

const formInit_V = { messageTextInput: "" };

function ChatDetails() {
  const router = useRouter();
  const profileData = useUserProfile();

  const [possibilityOfEnteringPhoneNumber, setPossibilityOfEnteringPhoneNumber] =
    useState<boolean>(false);
  const [isCompletePhoneNumber, setIsCompletePhoneNumber] = useState<boolean>(false);

  const [chatInfo, setChatInfo] = useState<ISingleChatDetails>();

  const { data, refetch } = useQuery(
    ["getSingleChatMessages", router?.query?.id],
    () =>
      getSingleChatMessages({
        order_id: Number(router?.query?.id),
      }),
    {
      enabled: !!router?.query?.id,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 10000, // in ms
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const chatData: ISingleChatDetails = data?.params;
        setChatInfo(chatData);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const addChatMessageMutation = useMutation(
    ({ text, order_id }: { text: string; order_id: number }) => {
      return submitChatMessage({
        text,
        order_id,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          formik.setFieldValue("messageTextInput", "");
          refetch();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues: formInit_V,
    validationSchema: Yup.object(yupSchema),
    validateOnChange: true,
    onSubmit: (values) => {
      if (!values.messageTextInput || possibilityOfEnteringPhoneNumber) return;

      addChatMessageMutation.mutate({
        order_id: Number(router?.query?.id as string),
        text: values.messageTextInput,
      });
    },
  });

  useEffect(() => {
    if (!!formik.values.messageTextInput) {
      const containsNumbersInRow =
        /\d{4,}/.test(formik.values.messageTextInput) || // for en digits
        /[\u06F0-\u06F90-9]{4,}/.test(formik.values.messageTextInput); // for persian digits

      const isCompletePhoneNumber =
        /\d{11,}/.test(formik.values.messageTextInput) || // for en digits
        /[\u06F0-\u06F90-9]{11,}/.test(formik.values.messageTextInput); // for persian digits

      setPossibilityOfEnteringPhoneNumber(containsNumbersInRow);
      setIsCompletePhoneNumber(isCompletePhoneNumber);

      // if (containsNumbersInRow) {
      //   setPossibilityOfEnteringPhoneNumber(true);
      //   setIsCompletePhoneNumber(isCompletePhoneNumber);
      // } else {
      //   setPossibilityOfEnteringPhoneNumber(false);
      //   setIsCompletePhoneNumber(isCompletePhoneNumber);
      // }
    }
  }, [formik.values.messageTextInput]);

  return (
    <div className={`relative h-screen max-h-screen`}>
      {/* Chat bg */}
      <div className="w-full h-screen absolute top-0 right-0 left-0 bg-gray-F8F8F8">
        <Image
          src={"/assets/chat-bg.svg"}
          fill
          style={{ objectFit: "cover" }}
          className="opacity-[7%]"
          alt=""
        />
      </div>
      {/* end of chat-bg */}

      <header className="fixed top-0 right-0 left-0 bg-white z-5">
        <div className="py-16 px-20 flex items-center justify-between">
          <div className="flex items-center gap-x-12">
            <div className="flex items-center cursor-pointer" onClick={() => router.back()}>
              <i className="icon-Back text-24 text-black" />
            </div>

            <div className="w-40 h-40 rounded-full relative">
              <Image
                // src={
                //   !!profileData.has_avatar && profileData.avatar_url
                //     ? `${profileData.avatar_url}`
                //     : "/assets/default-profile.svg"
                // }
                src="/assets/default-profile.svg"
                alt="آواتار"
                className="rounded-full"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>

            <div>
              <p className="text-14 leading-24 text-black font-r">{chatInfo?.contact.name}</p>
              <p className="text-10 leading-17 text-black font-l">
                کد رزرو :{chatInfo?.order_details?.reference}
              </p>
            </div>
          </div>

          <div>
            <LinkButton
              href={
                !!profileData.is_host
                  ? `/reservations/${chatInfo?.order_details?.id}`
                  : `/my-trips/${chatInfo?.order_details?.id}`
              }
              color="grey"
              className="!px-12 !py-4"
            >
              مشاهده رزرو
            </LinkButton>
          </div>
        </div>
      </header>

      <main className="pt-[73px] relative z-1">
        <div className="px-20 pt-16 pb-[92px] max-h-[calc(100vh-73px)] overflow-y-auto">
          <ChatMessagesSection
            rightEndAvatar={"/assets/default-profile.svg"}
            leftEndAvatar={"/assets/default-profile.svg"}
            leftSideName={chatInfo?.contact.name || ""}
            rightSideName={profileData?.name}
            payamHa={
              chatInfo?.messages.map((el) => ({
                id: el.id,
                seen: el.seen,
                senderName: el.sender,
                text: el.text,
                time: el.time,
                date: el.date,
              })) || []
            }
          />
        </div>
      </main>

      <div className="fixed bottom-0 right-0 left-0 z-5">
        <SubmitChatMessageArea
          formik={formik}
          possibilityOfEnteringPhoneNumber={possibilityOfEnteringPhoneNumber}
          isCompletePhoneNumber={isCompletePhoneNumber}
          canAttachFiles={false}
        />
      </div>
    </div>
  );
}

export default ChatDetails;
