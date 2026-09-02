import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getAmenityCatalog, saveAmenities, type CatalogAmenity } from "@/api/Residences/hostWizard";
import type { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import type { ISelectedExtraFeatures } from "@/interfaces/Residences/Submit/Steps/Step_6";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { Field, Section, StepSkeleton, TextArea, faDigits } from "../ui";

const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), { ssr: true });
const FacilityDetailsBottomSheet = dynamic(
  () => import("@/components/Residences/Edit/shared/FacilityDetailsBottomSheet"),
  { ssr: true }
);

/**
 * Step five: what the place has.
 *
 * 150,066 amenity links across the estate feed the search filters, so a
 * listing that answers none of them is filtered out of every search that
 * mentions a pool, a parking space or a kitchen.
 *
 * The details open in a sheet rather than inline, because inline does not fit:
 * «وسایل آشپزخانه» alone carries nineteen sub-questions. An earlier version of
 * this screen rendered them under the tile and got their shape wrong as well —
 * eighteen of those nineteen are CHECKBOX fields whose catalogue entry is the
 * pair «دارد, ندارد», and they were being stored as true/false. Both problems
 * are why the previous wizard put this behind a button, so this reuses that
 * same sheet rather than reimplementing it.
 *
 * ⚠️ `PATCH /amenities` deletes every amenity on the listing and recreates the
 * list it is handed, so `scopeIds` limits the replace to the ids this screen
 * owns — otherwise «نوع اقامتگاه» and «منطقه اقامتگاه», written on step one and
 * read by the SEO tag engine, would be deleted here.
 */

const CLASSIFICATION_KEYS = ["type", "area"];

/** The catalogue says CHECKBOX; the sheet was written against "checkbox". */
const toLegacyFeature = (feature: CatalogAmenity["features"][number]) => ({
  field_type: (feature.fieldType || "").toLowerCase(),
  name: feature.name,
  values: feature.values ?? "",
  placeholder: feature.placeholder ?? undefined,
});

const SHEET_CLOSED = { show: false, amenity: null as CatalogAmenity | null };

export default function AmenitiesStep() {
  const { draft, commit, saveState, next, setDirty, progressMarker } = useWizard();

  const { data: catalog, isLoading } = useQuery({
    queryKey: ["amenityCatalog"],
    queryFn: async () => {
      const res = await getAmenityCatalog();
      return res.ok ? res.data : [];
    },
    staleTime: 30 * 60 * 1000,
  });

  /** Everything except the two taxonomies step one owns. */
  const grid = useMemo<CatalogAmenity[]>(
    () => (catalog ?? []).filter((a) => !a.key || !CLASSIFICATION_KEYS.includes(a.key)),
    [catalog]
  );

  const sorted = useMemo(
    () => [...grid].sort((a, b) => a.name.localeCompare(b.name, "fa")),
    [grid]
  );

  const [ticked, setTicked] = useState<number[]>([]);
  const [extras, setExtras] = useState<ISelectedExtraFeatures>({});
  const [other, setOther] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [sheet, setSheet] = useState(SHEET_CLOSED);

  useEffect(() => {
    if (seeded || !draft) return;
    const ids: number[] = [];
    const answers: ISelectedExtraFeatures = {};
    (draft.amenities ?? []).forEach((row) => {
      ids.push(row.amenityId);
      const extra = (row.extraFeatures as { extra?: Record<string, string | number> })?.extra;
      if (extra) answers[row.amenityId] = extra;
    });
    setTicked(ids);
    setExtras(answers);
    setOther(draft.otherAmenities ?? "");
    setSeeded(true);
  }, [draft, seeded]);

  const toggle = (id: number) => {
    setDirty(true);
    setTicked((previous) =>
      previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id]
    );
  };

  /** How many sub-answers a tile is carrying, for the button's label. */
  const answeredCount = (id: number) =>
    Object.values(extras[id] ?? {}).filter((v) => v !== "" && v !== undefined).length;

  function onNext() {
    commit(async (id) =>
      saveAmenities(id, {
        amenities: ticked.map((amenityId) => {
          const extra = extras[amenityId];
          return {
            amenityId,
            // The stored shape is { value, extra } — `extra` holds the
            // sub-answers, keyed by the feature's own name.
            extraFeatures: extra && Object.keys(extra).length ? { extra } : undefined,
          };
        }),
        other: other.trim() || undefined,
        step: progressMarker,
        scopeIds: grid.map((a) => a.id),
      })
    );
    setDirty(false);
    next();
  }

  if (isLoading || !seeded) return <StepSkeleton />;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      nextLabel={ticked.length === 0 ? "فعلاً رد کن" : "ذخیره و ادامه"}
      footerNote={
        ticked.length > 0 ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            {faDigits(ticked.length)} مورد انتخاب شده
          </p>
        ) : null
      }
    >
      <Section title="امکانات">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10">
          {sorted.map((amenity) => {
            const on = ticked.includes(amenity.id);
            const hasDetails = amenity.features.length > 0;
            const answered = answeredCount(amenity.id);

            return (
              <div
                key={amenity.id}
                className={`rounded-12 border transition-colors ${
                  on ? "border-primary-main bg-primary-light/30" : "border-gray-DBDFE5 bg-white"
                }`}
              >
                <label className="flex items-center gap-x-12 p-14 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(amenity.id)}
                    className="w-20 h-20 shrink-0 accent-primary-main cursor-pointer"
                  />
                  {amenity.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={amenity.iconUrl}
                      alt=""
                      className="w-24 h-24 object-contain shrink-0"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="grow text-14 leading-24 font-m text-black">{amenity.name}</span>
                </label>

                {/*
                  Only once the amenity is ticked. Offering to configure
                  something the listing does not have is a question about
                  nothing.
                */}
                {on && hasDetails && (
                  <div className="px-14 pb-14">
                    <button
                      type="button"
                      onClick={() => setSheet({ show: true, amenity })}
                      className="w-full h-[40px] rounded-10 border border-primary-main bg-white text-13 font-m text-primary-dark flex items-center justify-center gap-x-6 transition-colors hover:bg-primary-light/40"
                    >
                      <i className="icon-Setting text-16" />
                      ویژگی‌ها
                      {answered > 0 && (
                        <span className="text-11 font-l text-gray-77828F">
                          ({faDigits(answered)} مورد)
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Field label="امکانات دیگر" optionalNote hint="هر چیزی که در فهرست بالا نبود.">
        {(props) => (
          <TextArea
            {...props}
            value={other}
            onChange={(e) => {
              setOther(e.target.value);
              setDirty(true);
            }}
            rows={3}
            placeholder="مثلاً: آلاچیق، زمین والیبال"
          />
        )}
      </Field>

      {sheet.show && sheet.amenity && (
        <BottomSheet
          open={sheet.show}
          handleClose={() => setSheet(SHEET_CLOSED)}
          headerTitle={sheet.amenity.name}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => (
            <FacilityDetailsBottomSheet
              handleSmoothClose={handleSmoothClose}
              extraFeaturesData={sheet.amenity!.features.map(toLegacyFeature) as never}
              selectedExtraFeatures={extras}
              setSelectedExtraFeatures={
                ((updater: never) => {
                  setDirty(true);
                  setExtras(updater);
                }) as never
              }
              facilityId={sheet.amenity!.id}
            />
          )}
        />
      )}
    </StepLayout>
  );
}
