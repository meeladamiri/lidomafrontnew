import { useQuery } from "@tanstack/react-query";
import { Button, LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import { useEffect, useMemo, useState } from "react";
import ResidenceCart from "components/Residences/ResidenceCart";
import Tabs from "components/General/core/Tabs";
import UnHappyMessage from "components/General/UnHappyMessage";
import SectionError from "components/General/SectionError";
import { miladiToJalali } from "utilities/dateTools";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { ResidencesList_ActiveTab_KEYWORD } from "@/constants/session_stores/residences_list";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { TabsSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { ResidenceCartSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/ResidenceCartSkeleton";
import { IServerResidence, getResidencesList } from "@/api/Residences/getResidencesList";
import { SECTION_STEP_KEY } from "@/api/Residences/hostWizard";
import { faDigits } from "@/components/Residences/SubmitWizard/ui";

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
  // Host's own deactivate toggle — distinct from admin suspension above.
  // Always last: it's the terminal, least-common state to land in.
  { key: "deactivated", label: "غیرفعال", match: (r) => r.raw_state === "DEACTIVATED" },
];

const EMPTY_MESSAGE: Record<string, string> = {
  active: "اقامتگاه فعالی نداری",
  all: "هنوز اقامتگاهی رو ثبت نکردی !",
  suspended: "اقامتگاه معلقی نداری",
  drafting: "اقامتگاه درحال تکمیلی نداری",
  in_review: "اقامتگاهی در انتظار بررسی نداری",
  defective: "اقامتگاه دارای نقصی نداری",
  deactivated: "اقامتگاه غیرفعالی نداری",
};

function badgeFor(r: IServerResidence): { text: string; bgColorClass: string } | undefined {
  if (r.suspended) return { text: "معلق", bgColorClass: "bg-warning" };
  if (r.has_open_defect) return { text: "دارای نقص", bgColorClass: "bg-error-light" };
  if (r.defect_review_requested || (r.raw_state === "PUBLISHED" && r.has_pending_changes))
    return { text: "در انتظار بررسی", bgColorClass: "bg-blue-main" };
  return undefined;
}

function defectNoteFor(r: IServerResidence) {
  if (!r.has_open_defect || r.open_defects.length === 0) return undefined;
  const [first, ...rest] = r.open_defects;
  return {
    description: first.description,
    sectionKey: SECTION_STEP_KEY[first.section],
    extraCount: rest.length,
  };
}

const pageSize = 8;

function ResidencesList() {
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);
  const [residencesList, setResidencesList] = useState<IServerResidence[]>();
  const [shown, setShown] = useState(pageSize);

  const { isLoading, data, isError, isFetching, refetch } = useQuery(["getResidencesList"], () =>
    getResidencesList()
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setResidencesList(data?.params?.residences);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  // Tabs with nothing in them are hidden (e.g. no point showing «دارای نقص»
  // when nothing has a defect) — so which tabs exist depends on the data.
  const visibleTabs = useMemo(() => {
    if (!residencesList) return TABS;
    return TABS.filter((t) => residencesList.some(t.match));
  }, [residencesList]);

  // Preserving which tab was open, by key rather than index — a hidden tab
  // can appear/disappear between visits as the underlying data changes, so
  // an index into a shorter or reordered array would silently point at the
  // wrong tab.
  useEffect(() => {
    if (activeTabKey) sessionStorage.setItem(ResidencesList_ActiveTab_KEYWORD, activeTabKey);
  }, [activeTabKey]);

  useEffect(() => {
    const stored = sessionStorage.getItem(ResidencesList_ActiveTab_KEYWORD);
    // A key from an old numeric-index scheme (or one no longer valid) falls
    // back to «فعال» instead of silently landing on the wrong tab.
    setActiveTabKey(stored && TABS.some((t) => t.key === stored) ? stored : TABS[0].key);
  }, []);
  // End of Preserving Tab-key

  // If the active tab's last listing just got fixed/resolved and the tab
  // disappears, fall back to «همه» rather than showing a blank strip.
  useEffect(() => {
    if (!residencesList || !activeTabKey) return;
    if (!visibleTabs.some((t) => t.key === activeTabKey)) setActiveTabKey("all");
  }, [residencesList, visibleTabs, activeTabKey]);

  // Resets the page size back to one page whenever the tab changes, so
  // switching tabs doesn't carry over how far a different list was scrolled.
  useEffect(() => {
    setShown(pageSize);
  }, [activeTabKey]);

  const activeTabDef = useMemo(
    () => visibleTabs.find((t) => t.key === activeTabKey),
    [visibleTabs, activeTabKey]
  );

  const matched = useMemo(() => {
    if (!activeTabDef || !residencesList) return undefined;
    return residencesList.filter(activeTabDef.match);
  }, [activeTabDef, residencesList]);

  const list = matched?.slice(0, shown);

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || !activeTabDef;
  }, [isLoading, activeTabDef]);

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
      ) : isError || !residencesList ? (
        // «هنوز اقامتگاهی رو ثبت نکردی» offers to start a listing — the wrong
        // thing to say to a host with nineteen of them and a failed request.
        <SectionError
          title="اقامتگاه‌ها بارگذاری نشد"
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
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
              scroll
              activeIndex={visibleTabs.findIndex((t) => t.key === activeTabKey)}
              onChange={(idx: number) => setActiveTabKey(visibleTabs[idx].key)}
              data={visibleTabs.map((t, tabIndex) => ({
                tabLabel: !!residencesList
                  ? `${t.label} (${faDigits(residencesList.filter(t.match).length)})`
                  : t.label,
                tabIndex,
              }))}
            />
          </div>

          <div className="grid grid-cols-12 sm:gap-x-16 md:gap-x-16 gap-y-16 sm:gap-y-16 md:gap-y-24">
            {!list || list.length === 0 ? (
              <div className="pt-40 col-span-full">
                <UnHappyMessage
                  title={activeTabDef ? EMPTY_MESSAGE[activeTabDef.key] : ""}
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
                    defectNote={defectNoteFor(r)}
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
                نمایش بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default ResidencesList;
