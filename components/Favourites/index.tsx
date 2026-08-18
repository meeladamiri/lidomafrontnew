import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "components/General/PageTitle";
import FavouriteCart from "components/Favourites/FavouriteCart";
import { Button, LinkButton } from "components/General/core/Button";
import UnHappyMessage from "components/General/UnHappyMessage";
import Image from "next/image";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import ShareBottomSheet, { IShare } from "components/General/Share/ShareBottomSheet";
import { useQuery } from "@tanstack/react-query";
import { getFavourites, IFavouriteItem } from "api/Favourites";
import { TinyLoader } from "../General/Loader/TinyLoader";
import { renderPagination } from "@/utilities/Pagination";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { BASE_URL_SITE } from "@/configs/info";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

const shareInitialValues: IShare = {
  show: false,
  payload: {
    textToBeSmsed: "",
    link: "",
    whatsAppText: "",
    telegramText: "",
    twitter: {
      url_to_go: "",
      text_of_tweet: "",
      via: "",
    },
  },
};

function Favourites() {
  const [showShareBottomSheet, setShowShareBottomSheet] = useState<IShare>(shareInitialValues);
  const [page, setPage] = useState(1);

  const [favourites, setFavourites] = useState<IFavouriteItem[]>();

  const { isLoading, data } = useQuery(["getFavourites"], () => getFavourites());
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const pageSize = useMemo(() => {
    if (isDesktop) {
      return 15;
    } else {
      return 8;
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setFavourites(data?.params?.wishlist);
      }
    }
  }, [data]);

  return (
    <div className="pb-40 md:pb-80 ">
      <PageTitle
        title="علاقه مندی ها"
        icon={
          !isDesktop ? (
            <Image
              src="/assets/non-icomoon-icons/like.svg"
              width={24}
              height={24}
              alt="like"
              style={{
                width: "24px",
                height: "24px",
              }}
            />
          ) : undefined
        }
        containerClassname="mb-16"
      />

      {!favourites || isLoading ? (
        <TinyLoader />
      ) : favourites.length === 0 ? (
        <div className="pt-16 md:pt-140">
          <UnHappyMessage
            title="هنوز اقامتگاهی رو اضافه نکردی !"
            iconSrc="/assets/No-favourite.svg"
            subTitle={
              <div>
                هر اقامتگاهی که ازش خوشت میاد رو با کلیک بر روی{" "}
                <Image
                  src="/assets/non-icomoon-icons/like-fill.svg"
                  width={14}
                  height={12}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
                به این لیست اضافه کن، تا وقتی تخفیف میخوره خبرت کنیم .
              </div>
            }
            actions={
              <div className="w-full flex justify-center">
                <LinkButton
                  href="/search"
                  rightIcon={<i className="icon-Search text-white text-18" />}
                >
                  جستجوی اقامتگاه ها
                </LinkButton>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-y-16 sm:gap-x-16 md:gap-x-16 sm:gap-y-24 md:gap-y-24">
            {favourites.slice(0, pageSize * page).map((favourite, i) => {
              return (
                <div key={i} className="col-span-full sm:col-span-6 md:col-span-4">
                  <FavouriteCart
                    onShareBtnClick={() => {
                      const propertyPageUrl = `${BASE_URL_SITE}${getPropertyPageUrl({
                        residenceId: favourite.id,
                      })}`;

                      setShowShareBottomSheet({
                        show: true,
                        payload: {
                          textToBeSmsed: propertyPageUrl,
                          link: propertyPageUrl,
                          whatsAppText: propertyPageUrl,
                          telegramText: propertyPageUrl,
                          twitter: {
                            url_to_go: propertyPageUrl,
                            text_of_tweet: favourite.name,
                            via: "",
                          },
                        },
                      });
                    }}
                    name={favourite.name}
                    provice={favourite.province}
                    proviceId={favourite.province_id}
                    cityId={favourite.city_id}
                    city={favourite.city}
                    neighborhood={favourite.neighborhood}
                    rating={favourite.average_rating}
                    commentsN={favourite.reviews_count}
                    price={favourite.price || 0}
                    bedN={favourite.rooms_count}
                    referenceCode={favourite.reference}
                    maxCapacity={favourite.max_capacity}
                    images={favourite.images}
                    residenceId={favourite.id}
                    isFastEnabled={favourite.is_fast}
                    discountP={favourite.discount}
                    displayType={favourite.display_type}
                    resPureNameAlone={favourite.name2}
                  />
                </div>
              );
            })}
          </div>

          {!!renderPagination(page, pageSize, favourites.length) && (
            <div className="mt-16 md:mt-40 md:w-[280px] md:mx-auto">
              <Button
                isFullWidth
                color="black"
                variant="outlined"
                onClick={() => setPage((prev) => prev + 1)}
                rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
              >
                نمایش بیشتر
              </Button>
            </div>
          )}

          <BottomSheet
            open={!!showShareBottomSheet.show}
            handleClose={() => setShowShareBottomSheet(shareInitialValues)}
            headerTitle="اشتراک گذاری"
            body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
              return (
                <ShareBottomSheet
                  handleSmoothClose={handleSmoothClose}
                  whatIsBeingShared="اقامتگاه"
                  payload={showShareBottomSheet.payload}
                />
              );
            }}
          />
        </>
      )}
    </div>
  );
}

export default Favourites;
