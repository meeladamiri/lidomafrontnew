import { getFavourites, likeOrUnlikeResidence } from "@/api/Favourites";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { likeOrUnlikeResidenceActions_enum } from "@/constants/enums/like_Unlike_residence_actions";
import { UserType_enum, useUserProfile } from "@/providers/Profile";
import exception from "@/utilities/exception";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./core/Button";

// const likeSvg = (
//   <svg
//     id="heart-svg"
//     viewBox="467 392 58 57"
//     xmlns="http://www.w3.org/2000/svg"
//     focusable="false"
//     width="48"
//     height="48"
//   >
//     <g id="Group" fill="none" fill-rule="evenodd" transform="translate(467 392)">
//       <path
//         d="M29.144 20.773c-.063-.13-4.227-8.67-11.44-2.59C7.63 28.795 28.94 43.256 29.143 43.394c.204-.138 21.513-14.6 11.44-25.213-7.214-6.08-11.377 2.46-11.44 2.59z"
//         id="heart"
//         fill="rgba(0, 0, 0, 0.5)"
//         stroke="#fff"
//         stroke-width="2"
//       />
//       <circle id="main-circ" fill="#E2264D" opacity="0" cx="29.5" cy="29.5" r="1.5" />

//       <g id="grp7" opacity="0" transform="translate(7 6)">
//         <circle id="oval1" fill="#9CD8C3" cx="2" cy="6" r="2" />
//         <circle id="oval2" fill="#8CE8C3" cx="5" cy="2" r="2" />
//       </g>

//       <g id="grp6" opacity="0" transform="translate(0 28)">
//         <circle id="oval1" fill="#CC8EF5" cx="2" cy="7" r="2" />
//         <circle id="oval2" fill="#91D2FA" cx="3" cy="2" r="2" />
//       </g>

//       <g id="grp3" opacity="0" transform="translate(52 28)">
//         <circle id="oval2" fill="#9CD8C3" cx="2" cy="7" r="2" />
//         <circle id="oval1" fill="#8CE8C3" cx="4" cy="2" r="2" />
//       </g>

//       <g id="grp2" opacity="0" transform="translate(44 6)">
//         <circle id="oval2" fill="#CC8EF5" cx="5" cy="6" r="2" />
//         <circle id="oval1" fill="#CC8EF5" cx="2" cy="2" r="2" />
//       </g>

//       <g id="grp5" opacity="0" transform="translate(14 50)">
//         <circle id="oval1" fill="#91D2FA" cx="6" cy="5" r="2" />
//         <circle id="oval2" fill="#91D2FA" cx="2" cy="2" r="2" />
//       </g>

//       <g id="grp4" opacity="0" transform="translate(35 50)">
//         <circle id="oval1" fill="#F48EA7" cx="6" cy="5" r="2" />
//         <circle id="oval2" fill="#F48EA7" cx="2" cy="2" r="2" />
//       </g>

//       <g id="grp1" opacity="0" transform="translate(24)">
//         <circle id="oval1" fill="#9FC7FA" cx="2.5" cy="3" r="2" />
//         <circle id="oval2" fill="#9FC7FA" cx="7.5" cy="2" r="2" />
//       </g>
//     </g>
//   </svg>
// );

function LikeOrNot({
  hasBg = true,
  isItLiked,
  residenceId,
  showAsBtn,
  withoutWrapper,
  className,
}: {
  hasBg?: boolean;
  isItLiked?: boolean; // for external use
  residenceId: number;
  showAsBtn?: boolean;
  withoutWrapper?: boolean;
  className?: string;
}) {
  const profileData = useUserProfile();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  // const [favourites, setFavourites] = useState<IFavouriteItem[]>();
  const [isLiked, setIsLiked] = useState<boolean>(isItLiked || false);

  const {
    isLoading: getFavouritesIsLoading,
    data: favouritesData,
    refetch,
  } = useQuery(["getFavourites"], () => getFavourites());

  useEffect(() => {
    if (!!favouritesData) {
      // setFavourites(favouritesData?.params?.wishlist);
      if (!!favouritesData?.params?.wishlist?.find((el: any) => el.id === residenceId)) {
        setIsLiked(true);
      }
    }
  }, [favouritesData, residenceId]);

  const callLikeOrUnlikeMutation_API = useCallback(async () => {
    const resp = await likeOrUnlikeResidence({
      action: !!isLiked
        ? // !!favourites?.find((el) => el.id === residenceId)
          likeOrUnlikeResidenceActions_enum.REMOVE
        : likeOrUnlikeResidenceActions_enum.ADD,
      product_id: residenceId,
    });

    // console.log("respresp", resp);

    if (resp?.status === "success") {
      refetch();
    } else {
      setIsLiked((prev) => !prev);
      exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
    }
  }, [isLiked, residenceId, refetch]);

  const handleClick = useCallback(
    (event: any) => {
      if (profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC) {
        // user is authenticated and is host or guest
        event.stopPropagation();
        event.preventDefault();
        // user must be authenticated first
        exception.message([
          {
            type: EXCEPTIONTYPES.INFO,
            title: "برای افزودن به علاقه مندی ها، لطفا وارد سیستم شوید.",
          },
        ]);

        if (!!isDesktop) {
          profileData.authModalsUtils.setShowEnterPhoneNumberModal(true);
        } else {
          router.push(`/auth/enter_phone?redirectTo=${router.asPath}`);
        }
      } else {
        // user is authenticated and is host or guest
        event.stopPropagation();
        event.preventDefault();

        setIsLiked((prev) => !prev);
        callLikeOrUnlikeMutation_API();
      }
    },
    [
      callLikeOrUnlikeMutation_API,
      isDesktop,
      profileData.authModalsUtils,
      profileData.user_type,
      router,
    ]
  );

  function Icon({
    isLiked,
    shouldHandleClick,
    handleClick,
    className,
  }: {
    isLiked: boolean;
    shouldHandleClick: boolean;
    handleClick: (event: any) => void;
    className?: string;
  }) {
    return (
      <i
        onClick={(event) => {
          if (!!shouldHandleClick) {
            handleClick(event);
          }
        }}
        className={`${!!isLiked ? "icon-LikeFill text-red-main" : "icon-LIke"} text-24 md:text-17 ${
          className || ""
        }`}
      ></i>
    );
  }

  const NormalLike = useCallback(
    ({
      shouldHandleClick,
      className,
      withoutWrapper, // Just for TBT optimization. No hack here.
    }: {
      shouldHandleClick: boolean;
      className?: string;
      withoutWrapper?: boolean;
    }) => {
      return !!withoutWrapper ? (
        <Icon
          handleClick={handleClick}
          isLiked={isLiked}
          shouldHandleClick={shouldHandleClick}
          className={className}
        />
      ) : (
        <div
          className={` ${
            !!hasBg ? "bg-white" : ""
          } w-36 h-36  rounded-full flex items-center justify-center cursor-pointer ${
            className || ""
          }`}
          onClick={(event) => {
            if (!!shouldHandleClick) {
              handleClick(event);
            }
          }}
        >
          <Icon
            handleClick={handleClick}
            isLiked={isLiked}
            shouldHandleClick={shouldHandleClick}
            className={className}
          />

          {/* <input type="checkbox" id="likeCheckbox" checked={isLiked} />
          <label>{likeSvg}</label> */}
        </div>
      );
    },
    [handleClick, hasBg, isLiked]
  );

  return !!showAsBtn ? (
    <Button
      variant="outlined"
      color="white"
      rightIcon={<NormalLike shouldHandleClick={false} className="!w-auto !h-auto" />}
      onClick={(e) => {
        handleClick(e);
      }}
    >
      افزودن به علاقمندی ها
    </Button>
  ) : (
    <NormalLike shouldHandleClick={true} withoutWrapper={withoutWrapper} className={className} />
  );
}

export default LikeOrNot;
