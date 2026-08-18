import { Search_pages_Routes, Search_pages_Routes_abbr } from "./SearchPagesRoutes";

export const Non_authorization_routes = [
  "/",
  // "/s/room/[combination]",
  // "/b/room/[combination]",
  // "/h/room/[combination]",
  "/rentals/[id]",
  "/factor/[id]",
  ...Search_pages_Routes,
  // second pages routes
  "/about",
  "/contact-us",
  "/reserve-cancellation-policy",
  "/rules",
  "/job-opportunity",
  "/complaint",
  "/public-faqs",
  "/host/[id]",
];

export const Non_authorization_routes_abbr = [
  // "/", // NOTE: Handle this route seperately
  // "/s/room/",
  // "/b/room/",
  // "/h/room/",
  "/rentals/",
  "/factor/",
  ...Search_pages_Routes_abbr,
  // second pages routes
  "/about",
  "/contact-us",
  "/reserve-cancellation-policy",
  "/rules",
  "/job-opportunity",
  "/complaint",
  "/public-faqs",
  "/host",
];
