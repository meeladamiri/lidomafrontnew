import { useQuery } from "@tanstack/react-query";
import { Button, LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import ResidenceCart from "components/Residences/ResidenceCart";
import Tabs from "components/General/core/Tabs";
import UnHappyMessage from "components/General/UnHappyMessage";
import { miladiToJalali } from "utilities/dateTools";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { ResidencesList_ActiveTab_KEYWORD } from "@/constants/session_stores/residences_list";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { TabsSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { ResidenceCartSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/ResidenceCartSkeleton";
import { IServerResidence, getResidencesList } from "@/api/Residences/getResidencesList";

/**
 * Six tabs, each a pure predicate over what the API already computed —
 * `raw_state`, `published`, `suspended`, `has_pending_changes`,
 * `has_open_defect`, `defect_review_requested`. No tab needs its own
 * fetch: a host's whole listing set is small enough to filter client-side,
 * same as the three-tab version this replaces.
 *
 * A listing can match more than one predicate (e.g. published *and*
 * mid-review after an edit) — tabs are independent filters, not a
 * partition, matching «می‌تواند هم‌زمان فعال باشد و در انتظار بررسی».
 */
const TABS: { key: string; label: string; match: (r: IServerResidence) => boolean }[] = [
  { key: "active", label: "فعال", match: (r) => r.published },
  { key: "all", label: "همه", match: () => true },
  { key: "suspended", label: "معلق", match: (r) => r.suspended },
  { key: "drafting", label: "درحال تکمیل", match: (r) => r.raw_state === "DRAFT" },
  {
    key: "in_review",
    label: "در انتظار بررسی",
    match: (r) => r.raw_state === "PENDING" || r.has_pending_changes || r.defect_review_requested,
  },
  { key: "defective", label: "دارای نقص", match: (r) => r.has_open_defect },
];

const EMPTY_MESSAGE: Record<string, string> = {
  active: "اقامتگاه فعالی نداری",
  all: "هنوز اقامتگاهی رو ثبت نکردی !",
  suspended: "اقامتگاه معلقی نداری",
  drafting: "اقامتگاه درحال تکمیلی نداری",
  in_review: "اقامتگاهی در انتظار بررسی نداری",
  defective: "اقامتگاه دارای نقصی نداری",
};

function badgeFor(r: IServerResidence): { text: string; bgColorClass: string } | undefined {
  if (r.suspended) return { text: "معلق", bgColorClass: "bg-warning" };
  if (r.has_open_defect) return { text: "دارای نقص", bgColorClass: "bg-error-light" };
  if (r.defect_review_requested || (r.raw_state === "PUBLISHED" && r.has_pending_changes))
    return { text: "در انتظار بررسی", bgColorClass: "bg-blue-main" };
  return undefined;
}

const pageSize = 8;

function ResidencesList() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [residencesList, setResidencesList] = useState<IServerResidence[]>();
  const [shown, setShown] = useState(pageSize);

  const { isLoading, data } = useQuery(["getResidencesList"], () => getResidencesList());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setResidencesList(data?.params?.residences);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  // Preserving Tab-index
  useEffect(() => {
    if (!!activeTab || activeTab === 0) {
      sessionStorage.setItem(ResidencesList_ActiveTab_KEYWORD, activeTab.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    const residencesListActiveTab = sessionStorage.getItem(ResidencesList_ActiveTab_KEYWORD);
    const stored = !!residencesListActiveTab ? Number(residencesListActiveTab) : 0;
    // The saved index came from the old three-tab layout on someone's last
    // visit — out of range here, so it falls back to «فعال» instead of
    // silently landing on the wrong tab.
    setActiveTab(stored >= 0 && stored < TABS.length ? stored : 0);
  }, []);
  // End of Preserving Tab-index

  // Resets the page size back to one page whenever the tab changes, so
  // switching tabs doesn't carry over how far a different list was scrolled.
  useEffect(() => {
    setShown(pageSize);
  }, [activeTab]);

  const matched = useMemo(() => {
    if (activeTab === null || !residencesList) return undefined;
    return residencesList.filter(TABS[activeTab].match);
  }, [activeTab, residencesList]);

  const list = matched?.slice(0, shown);

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || activeTab === null;
  }, [isLoading, activeTab]);

  return (
    <div className="pb-40 ">
      <PageTitle
        title="اقامتگاه ها"
        icon={<i className="icon-Home text-24" />}
        containerClassname="mb-16"
      />

      {pageIsNotReady ? (
        <>
          <div className="mb-24">
            <TabsSkeleton />
          </div>

          {Array.from({ length: 4 }).map((_, i) => (
            <div className="mb-16 last:mb-0" key={i}>
              <ResidenceCartSkeleton />
            </div>
          ))}
        </>
      ) : residencesList?.length === 0 ? (
        <div className="pt-40">
          <UnHappyMessage
            title={"هنوز اقامتگاهی رو ثبت نکردی !"}
            iconSrc="/assets/No-residance.svg"
            actions={
              <div className="flex justify-center">
                <LinkButton href="/residences/submit">شروع ثبت اقامتگاه</LinkButton>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-24 overflow-x-auto">
            <Tabs
              activeIndex={activeTab as number}
              onChange={(idx: number) => setActiveTab(idx)}
              data={TABS.map((t, tabIndex) => ({
                tabLabel: !!residencesList
                  ? `${t.label} (${residencesList.filter(t.match).length})`
                  : t.label,
                tabIndex,
              }))}
            />
          </div>

          <div className="grid grid-cols-12 sm:gap-x-16 md:gap-x-16 gap-y-16 sm:gap-y-16 md:gap-y-24">
            {!list || list.length === 0 ? (
              <div className="pt-40 col-span-full">
                <UnHappyMessage
                  title={EMPTY_MESSAGE[TABS[activeTab as number].key]}
                  iconSrc="/assets/No-residance.svg"
                />
              </div>
            ) : (
              list.map((r) => (
                <div className="col-span-full sm:col-span-6 md:col-span-6 md:h-full" key={r.id}>
                  <ResidenceCart
                    residenceId={r.id}
                    state={r.state}
                    step={r.step}
                    completionPercent={r.completion_percent}
                    publicId={r.public_id ?? r.id}
                    resCode={String(r.public_id ?? r.id)}
                    resName={r.name}
                    lastUpdate={miladiToJalali(r.last_update_time)}
                    imageUrl={r.image_url}
                    displayType={r.res_type}
                    residenceType={ResidenceTypes_enum.PRODUCT}
                    badgeOverride={badgeFor(r)}
                  />
                </div>
              ))
            )}
          </div>

          {!!matched && matched.length > shown && (
            <div className="mt-16 md:mt-24 md:w-[280px] md:mx-auto">
              <Button
                variant="outlined"
                color="black"
                isFullWidth
                onClick={() => setShown((prev) => prev + pageSize)}
                rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
              >
                مشاهده نتایج بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default ResidencesList;
