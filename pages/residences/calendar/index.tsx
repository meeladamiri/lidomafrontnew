import EditResidenceCalendar from "components/Residences/Edit/Calendar";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, NextPage } from "next";

/**
 * «تقویم اقامتگاه» — its own destination.
 *
 * It used to be reachable only from a button on a listing card, which handed
 * the residence over through sessionStorage: the page could not be refreshed,
 * bookmarked, opened in a second tab, or linked to. Managing availability is
 * something a host does across dates and listings, not one listing at a time,
 * so it now has a route of its own — in the side menu on desktop and in the
 * bottom bar on mobile.
 *
 * `/residences/calendar/edit?residenceId=…` still works; it is the same
 * component, and the old links keep resolving.
 */

const page = "تقویم اقامتگاه";

const ResidenceCalendarPage: NextPage = () => <EditResidenceCalendar />;

export const getServerSideProps: GetServerSideProps = async () => {
  // NOTE: Keep index zero item for the title tag of page always.
  const metaTagsList = [`${page} | ${PROJECTNAMEFA}`];
  return { props: { metaTagsList } };
};

export default ResidenceCalendarPage;
