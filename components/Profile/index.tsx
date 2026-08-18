import { THandleSmoothClose } from "components/General/core/BottomSheet";
import ModalHeader from "components/General/core/ModalHeader";
import NameValueEditCart from "components/General/NameValueEditCart";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { IUpdateAccountInfo, updateAccountInfo } from "api/Dashboard";
import { useMutation } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { month } from "components/General/MobileDatepicker";
import { useUserProfile } from "providers/Profile";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import Image from "next/image";
import PageTitle from "../General/PageTitle";
import dynamic from "next/dynamic";

const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), { ssr: false });
const CartMelliPictureBottomSheet = dynamic(() => import("./CartMelliPictureBottomSheet"), {
  ssr: false,
});
const ProfilePictureBottomSheet = dynamic(() => import("./ProfilePictureBottomSheet"), {
  ssr: false,
});
const DeleteAccountBottomSheet = dynamic(() => import("./DeleteAccountBottomSheet"), {
  ssr: false,
});
const NationalCodeBottomSheet = dynamic(() => import("./NationalCodeBottomSheet"), {
  ssr: false,
});
const FullnameBottomSheet = dynamic(() => import("./FullnameBottomSheet"), {
  ssr: false,
});
const EmergencyCallPhoneNumberBottomSheet = dynamic(
  () => import("./EmergencyCallPhoneNumberBottomSheet"),
  {
    ssr: false,
  }
);
const EmailBottomSheet = dynamic(() => import("./EmailBottomSheet"), {
  ssr: false,
});
const DescAboutYourselfBottomSheet = dynamic(() => import("./DescAboutYourselfBottomSheet"), {
  ssr: false,
});
const ChangePasswordBottomSheet = dynamic(() => import("./ChangePasswordBottomSheet"), {
  ssr: false,
});
const BirthDateBottomSheet = dynamic(() => import("./BirthDateBottomSheet"), {
  ssr: false,
});

function Profile() {
  const router = useRouter();

  const [showFullNameBottomSheet, setShowFullNameBottomSheet] = useState(false);
  const [showEmergencyCallPhoneNumberBottomSheet, setShowEmergencyCallPhoneNumberBottomSheet] =
    useState(false);
  const [showEmailBottomSheet, setShowEmailBottomSheet] = useState(false);
  const [showNationalCodeBottomSheet, setShowNationalCodeBottomSheet] = useState(false);
  const [showNationalCartImageBottomSheet, setShowNationalCartImageBottomSheet] = useState(false);
  const [showBirthDateBottomSheet, setShowBirthDateBottomSheet] = useState(false);
  // const [showGenderBottomSheet, setShowGenderBottomSheet] = useState(false);
  const [showDescAboutYourselfBottomSheet, setShowDescAboutYourselfBottomSheet] = useState(false);
  const [showChangePasswordBottomSheet, setShowChangePasswordBottomSheet] = useState(false);
  const [showDeleteAccountBottomSheet, setShowDeleteAccountBottomSheet] = useState(false);
  const [showChangeProfilePictureBottomSheet, setShowChangeProfilePictureBottomSheet] =
    useState(false);

  const profileData = useUserProfile();

  const profileItems = useMemo(() => {
    // console.log("memoizing");
    return [
      {
        name: "نام و نام خانوادگی :",
        value: profileData?.name,
        onEdit: () => setShowFullNameBottomSheet(true),
        editable: true,
      },
      {
        name: "شماره موبایل :",
        value: profileData?.phone,
        onEdit: null,
        editable: false,
      },
      {
        name: "شماره تماس اضطراری :",
        value: profileData?.emergency_phone,
        onEdit: () => setShowEmergencyCallPhoneNumberBottomSheet(true),
        editable: true,
      },
      {
        name: "آدرس ایمیل‌ :",
        value: profileData?.email,
        onEdit: () => setShowEmailBottomSheet(true),
        editable: true,
      },
      {
        name: "کد ملی :",
        value: profileData?.national_code,
        onEdit: () => setShowNationalCodeBottomSheet(true),
        editable: true,
      },
      {
        name: "تصویر کارت ملی :",
        value: !!profileData?.national_card_url ? "تنظیم شده" : "",
        onEdit: () => setShowNationalCartImageBottomSheet(true),
        editable: true,
      },

      {
        name: "تاریخ تولد :",
        value:
          !profileData?.birth_year || !profileData?.birth_month || !profileData?.birth_day
            ? "تاریخ تولد خود را انتخاب کنید"
            : `${profileData?.birth_day} ${month[profileData?.birth_month - 1]} ${
                profileData?.birth_year
              }`,
        onEdit: () => setShowBirthDateBottomSheet(true),
        editable: true,
      },
      // {
      //   name: "جنسیت :",
      //   value: profileData?.address
      //   onEdit: () => setShowGenderBottomSheet(true),
      //   editable: true,
      // },
      {
        name: "توضیحاتی در مورد خودتان :",
        value: "",
        onEdit: () => setShowDescAboutYourselfBottomSheet(true),
        editable: true,
        subJsx: (
          <p className="text-12 leading-21 text-[rgba(28,46,69,0.6)] font-l">
            {profileData?.description}
          </p>
        ),
      },
    ];
  }, [profileData]);

  function closeAllBottomSheets() {
    setShowFullNameBottomSheet(false);
    setShowEmergencyCallPhoneNumberBottomSheet(false);
    setShowEmailBottomSheet(false);
    setShowNationalCodeBottomSheet(false);
    setShowNationalCartImageBottomSheet(false);
    setShowBirthDateBottomSheet(false);
    // setShowGenderBottomSheet(false);
    setShowDescAboutYourselfBottomSheet(false);
    setShowChangePasswordBottomSheet(false);
    setShowDeleteAccountBottomSheet(false);
    setShowChangeProfilePictureBottomSheet(false);
  }

  const updateAccount = useMutation(
    (data: IUpdateAccountInfo) => {
      return updateAccountInfo({
        name: data.name,
        national_code: data.national_code,
        phone: data.phone,
        emergency_phone: data.emergency_phone,
        province_id: data.province_id,
        city: data.city,
        email: data.email,
        zip: data.zip,
        address: data.address,
        birth_day: data.birth_day,
        birth_month: data.birth_month,
        birth_year: data.birth_year,
        education: data.education,
        job: data.job,
        fax: data.fax,
        description: data.description,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          profileData?.profileQueryUtils?.refetchProfile?.();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);

          closeAllBottomSheets();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <div className="relative">
      <div className="fixed top-0 right-0 left-0 z-1 md:hidden">
        {/* TODO: Make this header sticky to top */}
        <ModalHeader
          headerTitle={"ویرایش حساب کاربری"}
          onBackClick={() => router.back()}
          // containerClassname="bg-white"
        />
      </div>

      <div className="pt-80 md:pt-0">
        {!!profileData?.profileQueryUtils?.profileDataIsLoading ? (
          <TinyLoader />
        ) : (
          <>
            <div className="">
              <PageTitle
                title="اطلاعات حساب کاربری"
                // icon={undefined}
                containerClassname="mb-24 hidden md:flex"
              />

              <div className="md:border-1 md:border-solid md:border-gray-CACFD3 md:rounded-20 md:p-24">
                <div className="flex flex-col items-center gap-y-12 mb-24">
                  <div className="w-80 h-80 relative">
                    <Image
                      src={
                        !!profileData.has_avatar && profileData.avatar_url
                          ? `${profileData.avatar_url}`
                          : "/assets/default-profile.svg"
                      }
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                      alt="آواتار"
                      className="rounded-full"
                    />
                    <div
                      onClick={() => setShowChangeProfilePictureBottomSheet(true)}
                      className="cursor-pointer w-32 h-32 flex items-center justify-center bg-primary-main rounded-full absolute bottom-0 right-0"
                    >
                      <i className="icon-Edit text-21 text-white" />
                    </div>
                  </div>

                  <p className="text-16 font-m leading-28 text-zilgara">{profileData?.name}</p>
                </div>

                <div className="mb-16 md:max-w-[276px] md:mx-auto">
                  {/* NOTE: Once upon a time, figma design was like the below component. Don't delete this, Maybe they will change it. */}
                  {/* <ProfileStatus
                status={
                  profileData?.status === "confirmed"
                    ? "verified"
                    : profileData?.status === "not_confirmed"
                    ? "rejected"
                    : profileData?.status === "checking"
                    ? "pending"
                    : ""
                }
              /> */}

                  {/* NOTE: For now, all accounts are cosidered as 'confirmed' */}
                  <div className="p-12 rounded-8 bg-green-light">
                    <div className="pr-12 border-r-2 border-r-success border-solid flex items-center justify-between">
                      <p className="text-success text-14 leading-20 font-m">
                        حساب کاربری شما تأیید شده است
                      </p>
                      <i className="icon-Success text-22 text-success" />
                    </div>
                  </div>
                </div>

                <div className="md:pt-24 md:border-t-1 md:border-dashed md:border-t-gray-CACFD3">
                  <div className="pb-16 md:pb-0 border-b-1 border-solid border-[rgba(28,52,84,0.26)] md:border-b-none grid grid-cols-12 gap-x-24 gap-y-24">
                    {profileItems.map((profileItem, i: number) => {
                      return (
                        <div
                          key={i}
                          className={`
                          ${
                            i === 0 || i === profileItems.length - 1
                              ? "col-span-full"
                              : "col-span-full md:col-span-6"
                          }
                        `}
                        >
                          <NameValueEditCart
                            name={profileItem.name}
                            value={profileItem.value}
                            onEditClick={profileItem.onEdit}
                            editable={profileItem.editable}
                            sub={!!profileItem.subJsx ? profileItem.subJsx : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-12 gap-x-24 md:mt-24">
                    <div className="col-span-full md:col-span-6 flex items-center justify-between py-16 md:py-0 border-b-1 md:border-b-none border-solid border-b-[rgba(28,52,84,0.26)]">
                      <p className="text-16 leading-28 text-black font-m">تغییر رمز عبور</p>

                      <div
                        onClick={() => setShowChangePasswordBottomSheet(true)}
                        className="w-40 h-40 rounded-6 flex items-center justify-center typical-gray-bg cursor-pointer"
                      >
                        <i className="icon-FlashLeft text-16" />
                      </div>
                    </div>

                    <div className="col-span-full md:col-span-6 flex items-center justify-between py-16 md:py-0">
                      <p className="text-16 leading-28 text-error-light font-m">حذف حساب کاربری</p>

                      <div
                        onClick={() => setShowDeleteAccountBottomSheet(true)}
                        className="w-40 h-40 rounded-6 flex items-center justify-center typical-gray-bg cursor-pointer"
                      >
                        <i className="icon-FlashLeft text-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <BottomSheet
              open={showFullNameBottomSheet}
              handleClose={() => setShowFullNameBottomSheet(false)}
              headerTitle="نام و نام خانوادگی"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <FullnameBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            <BottomSheet
              open={showEmergencyCallPhoneNumberBottomSheet}
              handleClose={() => setShowEmergencyCallPhoneNumberBottomSheet(false)}
              headerTitle="شماره تماس اضطراری"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <EmergencyCallPhoneNumberBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            <BottomSheet
              open={showEmailBottomSheet}
              handleClose={() => setShowEmailBottomSheet(false)}
              headerTitle="آدرس ایمیل"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <EmailBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            <BottomSheet
              open={showNationalCodeBottomSheet}
              handleClose={() => setShowNationalCodeBottomSheet(false)}
              headerTitle="کد ملی"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <NationalCodeBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            {/* <BottomSheet
            open={showGenderBottomSheet}
            handleClose={() => setShowGenderBottomSheet(false)}
            headerTitle="جنسیت"
            body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
              return (
                <GenderBottomSheet
                  handleSmoothClose={handleSmoothClose}
                  prevGender={profileData?.address as string}
                />
              );
            }}
          /> */}

            <BottomSheet
              open={showDescAboutYourselfBottomSheet}
              handleClose={() => setShowDescAboutYourselfBottomSheet(false)}
              headerTitle="توضیحاتی در مورد خودتان"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <DescAboutYourselfBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            <BottomSheet
              open={showChangePasswordBottomSheet}
              handleClose={() => setShowChangePasswordBottomSheet(false)}
              headerTitle="تغییر رمز عبور"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return <ChangePasswordBottomSheet handleSmoothClose={handleSmoothClose} />;
              }}
            />

            <BottomSheet
              open={showDeleteAccountBottomSheet}
              handleClose={() => setShowDeleteAccountBottomSheet(false)}
              headerTitle="حذف حساب کاربری"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <DeleteAccountBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    supportPhone={"09146695544"}
                  />
                );
              }}
            />

            <BottomSheet
              open={showBirthDateBottomSheet}
              handleClose={() => setShowBirthDateBottomSheet(false)}
              headerTitle="تاریخ تولد"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <BirthDateBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    updateAccountMutation={updateAccount}
                  />
                );
              }}
            />

            <BottomSheet
              open={showChangeProfilePictureBottomSheet}
              handleClose={() => setShowChangeProfilePictureBottomSheet(false)}
              headerTitle="تصویر پروفایل"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <ProfilePictureBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    prevProfileImage={
                      !!profileData.has_avatar && profileData.avatar_url
                        ? `${profileData.avatar_url}`
                        : "/assets/default-profile.svg"
                    }
                  />
                );
              }}
            />

            <BottomSheet
              open={showNationalCartImageBottomSheet}
              handleClose={() => setShowNationalCartImageBottomSheet(false)}
              headerTitle="تصویر کارت ملی"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <CartMelliPictureBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    prevCartMelli={`${profileData?.national_card_url}` || ""}
                  />
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
