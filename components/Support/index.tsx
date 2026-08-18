import PageTitle from "components/General/PageTitle";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/providers/Profile";
import SidebarWrapper, { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { SupportPageFAQs } from "./SupportPageFAQs";
import { SidebarCommonHeader } from "../General/Sidebar/SidebarCommonHeader";
import { SidebarCommonBody } from "../General/Sidebar/SidebarCommonBody";
import BottomSheet, { THandleSmoothClose } from "../General/core/BottomSheet";
import CallSupportBottomSheet from "./CallSupportBottomSheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getSupportPageMessages,
  ISupportChatMessage,
  submitNewMessageInSupportPage,
} from "@/api/chats";

import ChatMessagesSection from "../Chat/ChatMessagesSection";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { useFormik } from "formik";
// import ChatCart from "./ChatCart";
import * as Yup from "yup";
import SubmitChatMessageArea from "../Chat/SubmitChatMessageArea";
import CallSupport from "./CallSupport";

const StaticItem = ({
  image,
  text,
  onClick,
}: {
  image: JSX.Element;
  text: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={() => {
        if (!!onClick) onClick();
      }}
      className="py-8 px-8 flex items-center justify-center gap-x-8 cursor-pointer shadow-[0px_4px_15px_rgba(0,0,0,0.1)] rounded-12 bg-white"
    >
      {image}

      <p className="text-14 leading-24 text-black font-r">{text}</p>
    </div>
  );
};

const yupSchema = {
  messageTextInput: Yup.string(),
  // .test(
  //   `تبادل شماره تماس تا قبل از قطعی شدن رزرو، خلاف قوانین سایت می باشد و در صورت انجام این کار ، حساب کاربری شما مسدود خواهد شد.`,
  //   (value) => !/\d{4,}/.test(value || "")
  // ),
};

const formInit_V = { messageTextInput: "" };

function Support() {
  const [showFAQ_Sidebar, setShowFAQ_Sidebar] = useState<boolean>(false);
  const [showCallSupportBottomSheet, setShowCallSupportBottomSheet] = useState<boolean>(false);
  const profileData = useUserProfile();
  const [chatInfo, setChatInfo] = useState<ISupportChatMessage[]>([]);

  const [possibilityOfEnteringPhoneNumber, setPossibilityOfEnteringPhoneNumber] =
    useState<boolean>(false);
  const [isCompletePhoneNumber, setIsCompletePhoneNumber] = useState<boolean>(false);

  const profile = useUserProfile();

  const { isSuccess, isLoading, data, refetch } = useQuery(
    ["getSupportPageMessages"],
    () => getSupportPageMessages(),
    {
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 10000, // in ms
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const supportPageChatData: ISupportChatMessage[] = data?.params.messages;
        setChatInfo(supportPageChatData);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const addNewMessageInSupportPageMutation = useMutation(
    ({ text }: { text: string }) => {
      return submitNewMessageInSupportPage({
        text,
        // order_id,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.data?.status === "success") {
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

      addNewMessageInSupportPageMutation.mutate({
        text: values.messageTextInput,
      });
    },
  });

  return (
    <>
      <div className="h-[calc(100vh-84px)] md:hidden">
        <div className="flex flex-col h-full">
          <PageTitle
            title="پشتیبانی"
            icon={<i className="icon-OnlineContact text-24 text-black" />}
            containerClassname="mb-24"
          />

          <div className="grid grid-cols-12 gap-x-16 mb-16">
            <div className="col-span-6">
              {/* <Link href={`tel:${profile?.contact_phone}`} passHref> */}
              <StaticItem
                image={
                  <Image
                    src="/assets/non-icomoon-icons/Call_Icon.svg"
                    width={25}
                    height={25}
                    alt=""
                  />
                }
                text="تماس تلفنی"
                onClick={() => setShowCallSupportBottomSheet(true)}
              />
              {/* </Link> */}
            </div>
            <div className="col-span-6">
              <StaticItem
                image={
                  <Image
                    src="/assets/non-icomoon-icons/support-message.svg"
                    width={25}
                    height={25}
                    alt=""
                  />
                }
                text="سوالات متداول"
                onClick={() => setShowFAQ_Sidebar(true)}
              />
            </div>
          </div>

          <div className="w-full grow h-[calc(100%-192px)] absolute bottom-0 right-0 left-0 z-1 pb-80 md:pb-0">
            <div className="h-full shadow-[0px_-8px_16px_rgba(24,39,58,0.03)] bg-white rounded-tr-[24px] rounded-tl-[24px] CustomContainer">
              {/* header */}
              <div className="py-12 border-b-1 border-gray-D2D2D7 border-solid text-center mb-16">
                ارسال پیام به پشتیبانی
              </div>

              {/* body */}
              <div className="h-[calc(100%-65px)] overflow-y-auto">
                <ChatMessagesSection
                  rightEndAvatar={"/assets/default-profile.svg"}
                  leftEndAvatar={"/assets/default-profile.svg"}
                  leftSideName={"admin"}
                  rightSideName={profileData?.name}
                  payamHa={
                    chatInfo?.map((el) => ({
                      id: el.id,
                      seen: true,
                      senderName: el.sender,
                      text: el.text,
                      time: el.date.split(" ")[1],
                      date: el.date.split(" ")[0],
                    })) || []
                  }
                />
              </div>

              <div className="fixed bottom-0 right-0 left-0 z-5">
                <SubmitChatMessageArea
                  formik={formik}
                  possibilityOfEnteringPhoneNumber={possibilityOfEnteringPhoneNumber}
                  isCompletePhoneNumber={isCompletePhoneNumber}
                  hasBorderTop
                  canAttachFiles
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block pb-80">
        <PageTitle
          title="پشتیبانی"
          // icon={}
          containerClassname="mb-24"
        />

        <div className="grid grid-cols-14 md:gap-x-16 h-[662px]">
          <div className="col-span-6 h-full flex flex-col">
            <div className="p-24 border-gray-CACFD3 border-solid border-1 rounded-20 mb-16">
              <CallSupport />
            </div>

            <div className="p-24 grow border-gray-CACFD3 border-solid border-1 rounded-20">
              <div className="h-[320px] overflow-y-auto">
                <SupportPageFAQs />
              </div>
            </div>
          </div>

          <div className="relative h-[662px] flex flex-col col-span-8 px-24 py-16 border-gray-CACFD3 border-solid border-1 rounded-20">
            <div className="pb-16 border-b-1 border-solid border-b-gray-CACFD3 mb-24">
              {/* header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-12">
                  <div className="w-40 h-40 relative">
                    <Image
                      src="/assets/tmp/profile.jpeg"
                      fill
                      style={{ objectFit: "cover" }}
                      alt="آواتار پشتیبانی"
                      className="rounded-full"
                    />

                    <span
                      style={{
                        outline: "2px solid #fff",
                      }}
                      className="w-10 h-10 absolute bottom-0 right-0 rounded-full bg-success"
                    ></span>
                  </div>

                  <div>
                    <p className="text-14 leading-24 font-r text-black mb-4">سعید رضائی</p>
                    <p className="text-10 leading-17 font-l text-black">پشتیبان لیدوماتریپ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-[80px] grow overflow-y-auto">
              <ChatMessagesSection
                rightEndAvatar={"/assets/default-profile.svg"}
                leftEndAvatar={"/assets/default-profile.svg"}
                leftSideName={"admin"}
                rightSideName={profileData?.name}
                payamHa={
                  chatInfo?.map((el) => ({
                    id: el.id,
                    seen: true,
                    senderName: el.sender,
                    text: el.text,
                    time: el.date.split(" ")[1],
                    date: el.date.split(" ")[0],
                  })) || []
                }
              />
            </div>

            <div className="absolute bottom-16 right-24 left-24 z-5">
              <SubmitChatMessageArea
                formik={formik}
                possibilityOfEnteringPhoneNumber={possibilityOfEnteringPhoneNumber}
                isCompletePhoneNumber={isCompletePhoneNumber}
                hasBorderTop
                canAttachFiles
                containerClassname="!px-0 !pb-0"
              />
            </div>
          </div>
        </div>
      </div>

      {!!showFAQ_Sidebar && (
        <SidebarWrapper
          isSidebarOpen={showFAQ_Sidebar}
          setIsSidebarOpen={setShowFAQ_Sidebar}
          content={({ handleSidebarClose }: { handleSidebarClose: THandleSidebarClose }) => (
            <div className="h-full">
              <SidebarCommonHeader
                onClose={() => handleSidebarClose()}
                headerText="سوالات متداول"
              />

              <SidebarCommonBody>
                <SupportPageFAQs />
              </SidebarCommonBody>
            </div>
          )}
        />
      )}

      <BottomSheet
        open={showCallSupportBottomSheet}
        handleClose={() => setShowCallSupportBottomSheet(false)}
        headerTitle="تماس با پشتیبانی"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return <CallSupportBottomSheet handleSmoothClose={handleSmoothClose} />;
        }}
      />
    </>
  );
}

export default Support;
