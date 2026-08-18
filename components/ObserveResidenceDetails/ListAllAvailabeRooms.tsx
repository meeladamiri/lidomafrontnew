import { IAvailableRoom } from "@/api/Boomgardi";
import Divider from "../General/Divider";
import BoomgardiRoomCart from "./BoomgardiRoomCart";
import BoomgardiRoomCartSkeleton from "./Skeletons/BoomgardiRoomCartSkeleton";
import { useGetAvailableRooms } from "Hooks/ObserveResidence/useGetAvailableRooms";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
import { Fragment } from "react";

function ListAllAvailabeRooms() {
  const { isLoading, data } = useGetAvailableRooms();
  const { setShowTripleCalendar } = useBoomgardiPropertyPageData();

  return (
    <section className="pb-24" id="rooms-listing-section">
      <header>
        <h2 className="text-16 leading-28 text-zilgara font-m mb-24">اتاق های قابل رزرو</h2>
      </header>

      {isLoading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => {
            return (
              <div key={i} className="mb-16 last:mb-0">
                <BoomgardiRoomCartSkeleton />
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {(data?.params?.rooms as IAvailableRoom[])?.map((item, index: number) => {
            return (
              <Fragment key={index}>
                <div
                  // key={index}
                  className="mb-16 last:mb-0"
                >
                  <BoomgardiRoomCart
                    roomInfoObj={item}
                    onRoomSelect={() => {
                      setShowTripleCalendar(true);
                    }}
                  />
                </div>
                {index < (data?.params?.rooms as IAvailableRoom[])?.length - 1 ? (
                  <Divider height="16px" className="mb-16" />
                ) : null}
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ListAllAvailabeRooms;
