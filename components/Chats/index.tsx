import {
  getAllChats,
  getSingleChatMessages,
  IChat,
  ISingleChatDetails,
  submitChatMessage,
} from "@/api/chats";
import { ChatStatus_enum } from "@/constants/enums/chat_status";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { useUserProfile } from "@/providers/Profile";
import { miladiToJalali } from "@/utilities/dateTools";
import exception from "@/utilities/exception";
import { renderPagination } from "@/utilities/Pagination";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useMutation, useQuery } from "@tanstack/react-query";
import Tabs from "components/General/core/Tabs";
import PageTitle from "components/General/PageTitle";
import UnHappyMessage from "components/General/UnHappyMessage";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../General/core/Button";
import ChatCart from "./ChatCart";
import { TinyLoader } from "../General/Loader/TinyLoader";
import ChatMessagesSection from "../Chat/ChatMessagesSection";
import SubmitChatMessageArea from "../Chat/SubmitChatMessageArea";
import { useFormik } from "formik";
import * as Yup from "yup";

const formInit_V = { messageTextInput: "" };
const yupSchema = {
  messageTextInput: Yup.string(),
  // .test(
  //   `تبادل شماره تماس تا قبل از قطعی شدن رزرو، خلاف قوانین سایت می باشد و در صورت انجام این کار ، حساب کاربری شما مسدود خواهد شد.`,
  //   (value) => !/\d{4,}/.test(value || "")
  // ),
};

function Chats() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [possibilityOfEnteringPhoneNumber, setPossibilityOfEnteringPhoneNumber] =
    useState<boolean>(false);
  const [isCompletePhoneNumber, setIsCompletePhoneNumber] = useState<boolean>(false);

  const [selectedChatId, setSelectedChatId] = useState<number>();
  const [chatInfo, setChatInfo] = useState<ISingleChatDetails>();

  const [pageSize, setPageSize] = useState<number>(10);

  const profileData = useUserProfile();

  const { isSuccess, isLoading, data } = useQuery(
    [
      "getAllChats",
      1, // for page
      pageSize,
      activeTab,
    ],
    () =>
      getAllChats({
        page: 1,
        page_size: pageSize,
        status: activeTab === 0 ? ChatStatus_enum.ACTIVE : ChatStatus_enum.ARCHIVED,
      })
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        // console.log("In success of getAllChats, data is: ", data);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  function onSelectChat(chatId: number) {
    setSelectedChatId(chatId);
  }

  const {
    isSuccess: isSuccessGetSingleChatMessages,
    isLoading: isLoadingGetSingleChatMessages,
    data: singleChatMessagesData,
    refetch: refetchSingleChatMessages,
  } = useQuery(
    ["getSingleChatMessages", selectedChatId],
    () =>
      getSingleChatMessages({
        order_id: selectedChatId as number,
      }),
    {
      enabled: !!selectedChatId,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 10000, // in ms
    }
  );

  // useEffect(() => {
  //   if (!!data) {
  //     if (data?.status === "success") {
  //       console.log("In success of getAllChats, data is: ", data);

  //       const chatData: ISingleChatDetails = data?.params;
  //       setChatInfo(chatData);
  //     } else {
  //       exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
  //     }
  //   }
  // }, [data]);

  useEffect(() => {
    if (!!singleChatMessagesData) {
      if (singleChatMessagesData?.status === "success") {
        const chatData: ISingleChatDetails = singleChatMessagesData?.params;
        setChatInfo(chatData);
      } else {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: singleChatMessagesData?.err_msg || defaultError },
        ]);
      }
    }
  }, [singleChatMessagesData]);

  useEffect(() => {
    setSelectedChatId(undefined);
  }, [activeTab]);

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
          refetchSingleChatMessages();
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
        order_id: chatInfo?.order_details.id as number,
        text: values.messageTextInput,
      });
    },
  });

  return (
    <div className="pb-40 md:pb-0">
      <PageTitle
        title="گفتگو ها"
        icon={<i className="icon-message text-24" />}
        containerClassname="mb-24"
      />

      <div className="w-[65%] md:w-full mx-auto mb-24">
        <Tabs
          activeIndex={activeTab}
          onChange={(idx: number) => {
            setActiveTab(idx);
          }}
          data={[
            {
              tabLabel: (
                <>
                  <span className="hidden md:inline">گفتگو های جاری</span>
                  <span className="md:hidden">جاری</span>
                </>
              ),
              tabIndex: 0,
            },
            {
              tabLabel: (
                <>
                  <span className="hidden md:inline">گفتگو های پایان یافته</span>
                  <span className="md:hidden">پایان یافته</span>
                </>
              ),

              tabIndex: 1,
            },
          ]}
        />
      </div>

      {(data?.params?.orders as IChat[])?.length === 0 ? (
        <div className="pt-64">
          <UnHappyMessage
            title="هنوز گفتگویی صورت نگرفته !"
            iconSrc="/assets/No-conversation.svg"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-14 md:gap-x-16">
            <div className="col-span-full md:col-span-6 md:p-24 md:border-gray-CACFD3 md:border-solid md:border-1 md:rounded-20 md:h-[624px]">
              <div className="md:h-full md:overflow-y-auto">
                {(data?.params?.orders as IChat[])?.map((chat, idx) => {
                  return (
                    <div
                      key={`${chat.id}-${idx}`}
                      className="mb-12 last:mb-0 md:border-b-1 md:border-solid md:border-b-gray-CACFD3"
                    >
                      <ChatCart
                        name={chat.contact.name}
                        image={chat.contact.avatar_url || "/assets/default-profile.svg"}
                        from={miladiToJalali(chat.start_date)}
                        to={miladiToJalali(chat.end_date)}
                        reserveCode={chat.reference}
                        isFinished={activeTab === 1}
                        action={chat?.action}
                        chatId={chat.id}
                        hasAroundBorder={!isDesktop}
                        onSelectChat={!!isDesktop ? () => onSelectChat(chat.id) : undefined}
                      />
                    </div>
                  );
                })}
              </div>

              {!!renderPagination(1, pageSize, (data?.params?.orders as IChat[])?.length) && (
                <Button
                  isFullWidth
                  color="black"
                  variant="outlined"
                  className="mt-48"
                  onClick={() => setPageSize((prev) => prev + 10)}
                >
                  نمایش بیشتر
                </Button>
              )}
            </div>

            <div className="hidden md:block md:col-span-8 md:px-24 md:pt-16 max-h-full h-full relative md:border-gray-CACFD3 md:border-solid md:border-1 md:rounded-20 md:h-[624px]">
              {!selectedChatId ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/assets/Chat-dialog-with-support-service.svg"
                    width={398}
                    height={491}
                    alt=""
                  />
                </div>
              ) : !!isLoadingGetSingleChatMessages || !chatInfo ? (
                <TinyLoader />
              ) : (
                <div className="pb-[82px] h-full overflow-y-auto">
                  <div className="w-full h-full absolute top-0 right-0 left-0 bottom-0 bg-gray-F8F8F8 rounded-20">
                    <Image
                      src={"/assets/chat-bg.svg"}
                      fill
                      style={{ objectFit: "cover", borderRadius: "20px" }}
                      className="opacity-[7%]"
                      alt=""
                    />
                  </div>

                  <div className="z-1 relative">
                    <ChatMessagesSection
                      rightEndAvatar={"/assets/default-profile.svg"}
                      leftEndAvatar={"/assets/default-profile.svg"}
                      leftSideName={chatInfo?.contact?.name || ""}
                      rightSideName={profileData?.name}
                      payamHa={
                        chatInfo?.messages?.map((el) => ({
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

                  <div className="absolute bottom-0 right-0 left-0 z-5">
                    <SubmitChatMessageArea
                      formik={formik}
                      possibilityOfEnteringPhoneNumber={possibilityOfEnteringPhoneNumber}
                      isCompletePhoneNumber={isCompletePhoneNumber}
                      canAttachFiles={false}
                      containerClassname="rounded-br-20 rounded-bl-20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Chats;
