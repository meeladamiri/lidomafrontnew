import { checkUserStatus } from "@/api/Auth/checkUserStatus";
import { useQuery } from "@tanstack/react-query";
import { getAccountInfo } from "api/Dashboard";
import { Iprofile_data } from "interfaces/Profile";
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";

import { getUserToken } from "utilities/cookies";
import { readTokenClaims } from "@/utilities/auth/claims";
import useIsomorphicLayoutEffect from "@/utilities/useIsomorphicLayoutEffect";

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

  /**
   * Who this is, taken from the session cookie before the browser paints.
   *
   * The shell used to learn it from two sequential requests, so a host was
   * shown the guest header, side panel and bottom bar until they came back —
   * the rearrangement that made logging in look like being moved between
   * panels.
   *
   * It cannot be the initial state: the server has no cookie in hand when it
   * renders, so seeding there makes the client's first render disagree with
   * the server's and React throws out the markup (a hydration mismatch — the
   * first attempt at this did exactly that). A layout effect runs after
   * hydration has matched but before paint, so the guest version is never
   * actually shown.
   */
  useIsomorphicLayoutEffect(() => {
    const claims = readTokenClaims();
    if (!claims) return;
    setState((prev) => ({
      ...prev,
      user_type: UserType_enum.AUTH,
      id: prev.id || (claims.id ?? 0),
      is_host: claims.isHost,
    }));
  }, []);

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
          user_type: UserType_enum.AUTH,
          id: checkUserStatusData?.data?.id,
          name: checkUserStatusData?.data?.name,
          phone: checkUserStatusData?.data?.phone,
          is_host: checkUserStatusData?.data?.isHost,
        }));
      } else {
        setState((prev) => ({ ...prev, user_type: UserType_enum.PUBLIC }));
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
    // Gated on the token, not on `checkUserStatus` having answered. Waiting
    // for that made the two requests a waterfall — the profile could not even
    // start until the status check finished — when nothing in it depends on
    // the other. They now run together, and a 401 tells us the same thing the
    // status check would have.
    enabled: !!getUserToken(),
  });

  useEffect(() => {
    if (data?.status === "success") {
      const userInfo: Iprofile_data = data?.params?.user_info;

      setState((prev) => ({
        ...prev,
        address: userInfo?.address,
        // The timestamp is a cache-buster, and it used to be glued straight onto
        // the URL with no separator: an avatar at
        //   .../migrated/avatar-e9-e9fb6763…
        // became
        //   .../migrated/avatar-e9-e9fb6763…1788286173000
        // which is a different object that does not exist, so every avatar
        // 404'd. It goes in the query string, where it busts the cache without
        // changing which file is being asked for.
        avatar_url: userInfo?.avatar_url
          ? `${userInfo.avatar_url}${userInfo.avatar_url.includes("?") ? "&" : "?"}v=${Date.now()}`
          : "",
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
