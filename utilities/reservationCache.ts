import type { QueryClient } from "@tanstack/react-query";

/**
 * Everything on screen that shows a reservation, refreshed together.
 *
 * A booking appears in four places — the host's list, the guest's trips, the
 * dashboard's pending-requests block, and the detail page — and until now an
 * action refreshed only the one it was fired from. Approving a request on the
 * detail page left the list still calling it pending, and the dashboard
 * counting it. The list papered over that with `staleTime: 0`, which refetched
 * all three buckets on every single visit whether anything had changed or not;
 * the trips list did the same.
 *
 * One call, so a new screen that shows bookings is added here rather than
 * remembered at eight call sites.
 *
 * Note the shape: `invalidateQueries(["a", "b"])` means the single key
 * `["a", "b"]`, not two keys — a mistake that was already live in
 * `ReserveCart`'s expiry timer, where it matched nothing at all and the list
 * quietly never refreshed when a request timed out.
 */
export function invalidateReservationViews(queryClient: QueryClient) {
  ["getReserve", "getReserves", "getMyTrips", "getDashboardData"].forEach((key) =>
    queryClient.invalidateQueries([key])
  );
}
