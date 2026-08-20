//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

export interface IAvailableRoom {
  amenities: {
    cooling_system: string;
    free_breakfast: boolean;
    heating_system: string;
    refrigerator?: "none" | "shared" | "dedicated";
    separate_bathroom: boolean;
    wc?: "none" | "shared" | "dedicated";
  };
  capacity: number;
  description: string;
  id: number;
  image: string; // ex: "https://test.lidomatrip.com/web/image/x_room/35062/x_image";
  is_fast: boolean;
  max_capacity: number;
  name: string;
  prices: {
    discount: number;
    extra_price: number;
    min_price: number;
    peak_price: number;
    week_price: number;
    weekend_price: number;
  };
  rooms_count: number;
}

const getAvailableRooms = async ({
  residenceId,
  startDate,
  endDate,
}: {
  residenceId: number;
  startDate: string; // ex: "1401/12/14"
  endDate: string; // ex: "1401/12/24"
}) => {
  const url = `/api/get_available_rooms`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id: residenceId,
      start_date: startDate,
      end_date: endDate,
    })
    .call();
};

// No backend equivalent yet (per-room availability/pricing for Boomgardi bookings).
const getAvailableRooms2 = getAvailableRooms;

export { getAvailableRooms, getAvailableRooms2 };
