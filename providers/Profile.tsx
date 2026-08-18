import { checkUserStatus } from "@/api/Auth/checkUserStatus";
import { useQuery } from "@tanstack/react-query";
import { getAccountInfo } from "api/Dashboard";
import { Iprofile_data } from "interfaces/Profile";
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { getUserToken } from "utilities/cookies";

type IState = Iprofile_data & {
  profileQueryUtils: {
    profileDataIsLoading?: boolean;
    profileDataIsSuccess?: boolean;
    refetchProfile?: any;
    refetchCheckUserStatus?: any;
  };
} & {
  user_type: null | UserType_enum;
} & {
  authModalsUtils: {
    showEnterPhoneNumberModal: boolean;
    setShowEnterPhoneNumberModal: Dispatch<SetStateAction<boolean>>;
    showEnterPasswordModal: boolean;
    setShowEnterPasswordModal: Dispatch<SetStateAction<boolean>>;
    showForgetPasswordModal: boolean;
    setShowForgetPasswordModal: Dispatch<SetStateAction<boolean>>;
    showOTPModal: boolean;
    setShowOTPModal: Dispatch<SetStateAction<boolean>>;
    showSignUpModal: boolean;
    setShowSignUpModal: Dispatch<SetStateAction<boolean>>;
  };
};

export const UserProfileContext = createContext<IState>({
  address: "",
  avatar_url: "",
  birth_day: 0,
  birth_month: 0,
  birth_year: 0,
  city: "",
  description: "",
  education: "",
  email: "",
  emergency_phone: "",
  fax: "",
  id: 0,
  job: "",
  name: "",
  national_card_url: "",
  national_code: "",
  phone: "",
  province: "",
  status: "",
  zip: "",
  profileQueryUtils: {},
  contact_phone: "",
  has_avatar: false,
  is_host: false,
  user_type: null,
  authModalsUtils: {
    showEnterPhoneNumberModal: false,
    setShowEnterPhoneNumberModal: () => {},
    showEnterPasswordModal: false,
    setShowEnterPasswordModal: () => {},
    showForgetPasswordModal: false,
    setShowForgetPasswordModal: () => {},
    showOTPModal: false,
    setShowOTPModal: () => {},
    showSignUpModal: false,
    setShowSignUpModal: () => {},
  },
});

export enum UserType_enum {
  AUTH = "auth",
  PUBLIC = "public",
}

function UserProfileProvider({ children }: { children: JSX.Element }) {
  const [showEnterPhoneNumberModal, setShowEnterPhoneNumberModal] = useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const profileStateInitValues: IState & { user_type: null | UserType_enum } = {
    address: "",
    avatar_url: "",
    birth_day: 0,
    birth_month: 0,
    birth_year: 0,
    city: "",
    description: "",
    education: "",
    email: "",
    emergency_phone: "",
    fax: "",
    id: 0,
    job: "",
    name: "",
    national_card_url: "",
    national_code: "",
    phone: "",
    province: "",
    status: "",
    zip: "",
    profileQueryUtils: {},
    contact_phone: "",
    has_avatar: false,
    is_host: false,
    user_type: null,
    authModalsUtils: {
      showEnterPhoneNumberModal,
      setShowEnterPhoneNumberModal,
      showEnterPasswordModal,
      setShowEnterPasswordModal,
      showForgetPasswordModal,
      setShowForgetPasswordModal,
      showOTPModal,
      setShowOTPModal,
      showSignUpModal,
      setShowSignUpModal,
    },
  };

  const [state, setState] = useState<IState & { user_type: null | UserType_enum }>(
    profileStateInitValues
  );

  const { refetch: refetchCheckUserStatus, data: checkUserStatusData } = useQuery(
    ["checkUserStatus"],
    () => checkUserStatus(),
    {
      enabled: !!getUserToken(),
    }
  );

  useEffect(() => {
    if (!!checkUserStatusData) {
      if (checkUserStatusData?.status === "success") {
        setState((prev) => ({
          ...prev,
          user_type: checkUserStatusData?.params.user as UserType_enum,
        }));
      } else {
        // TODO: Will be uncommented
        refetchCheckUserStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkUserStatusData]);

  const {
    isLoading: profileDataIsLoading,
    isSuccess: profileDataIsSuccess,
    refetch: refetchProfile,
    data,
  } = useQuery(["getAccountInfo"], () => getAccountInfo(), {
    enabled: state.user_type === UserType_enum.AUTH,
  });

  useEffect(() => {
    if (data?.status === "success") {
      const userInfo: Iprofile_data = data?.params?.user_info;

      setState((prev) => ({
        ...prev,
        address: userInfo?.address,
        avatar_url: `${userInfo?.avatar_url}${new Date().getTime()}`,
        birth_day: userInfo?.birth_day,
        birth_month: userInfo?.birth_month,
        birth_year: userInfo?.birth_year,
        city: userInfo?.city,
        description: userInfo?.description,
        education: userInfo?.education,
        email: userInfo?.email,
        emergency_phone: userInfo?.emergency_phone,
        fax: userInfo?.fax,
        id: userInfo?.id,
        job: userInfo?.job,
        name: userInfo?.name,
        national_card_url: userInfo?.national_card_url,
        national_code: userInfo?.national_code,
        phone: userInfo?.phone,
        province: userInfo?.province,
        status: userInfo?.status,
        zip: userInfo?.zip,
        profileQueryUtils: {},
        contact_phone: userInfo?.contact_phone, // This is support phone.
        has_avatar: userInfo?.has_avatar,
        is_host: userInfo?.is_host,
        current_trip: userInfo.current_trip,
      }));
    }
  }, [data]);

  return (
    <UserProfileContext.Provider
      value={{
        ...state,
        profileQueryUtils: {
          profileDataIsLoading,
          profileDataIsSuccess,
          refetchProfile,
          refetchCheckUserStatus,
        },
        authModalsUtils: {
          showEnterPhoneNumberModal,
          setShowEnterPhoneNumberModal,
          showEnterPasswordModal,
          setShowEnterPasswordModal,
          showForgetPasswordModal,
          setShowForgetPasswordModal,
          showOTPModal,
          setShowOTPModal,
          showSignUpModal,
          setShowSignUpModal,
        },
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  return { ...context };
}

export default UserProfileProvider;
