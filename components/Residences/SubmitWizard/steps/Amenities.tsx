import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAmenityCatalog,
  saveAmenities,
  type CatalogAmenity,
} from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { CheckCard, Field, Section, StepSkeleton, TextArea, TextInput, faDigits } from "../ui";

/**
 * Step five: what the place has.
 *
 * Not in the list the host was given, and here anyway: 150,066 amenity links
 * across the estate feed the search filters, and a listing that answers none
 * of them is filtered out of every search that mentions a pool, a parking
 * space or a kitchen. Dropping the step would have quietly cost new hosts
 * their visibility.
 *
 * ⚠️ `PATCH /amenities` deletes every amenity on the listing and recreates the
 * list it is handed. Sending only this grid's answers would therefore wipe
 * «نوع اقامتگاه» and «منطقه اقامتگاه» — the two the SEO tag pages are built
 * from — which step one has just written. `scopeIds` limits the replace to the
 * ids this screen actually owns.
 */

const CLASSIFICATION_KEYS = ["type", "area"];

interface Answer {
  value?: string | number | boolean;
  extra?: Record<string, string | number | boolean>;
}

export default function AmenitiesStep() {
  const { draft, residenceId, save, saveState, next, setDirty, progressMarker } = useWizard();

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

  /**
   * One list, not four.
   *
   * The catalogue's own `category` is a finer grouping — «رفاهی» (2 items),
   * «فضای اقامتگاه» (3), «امکانات بوم گردی» (1), «امکانات» (36) — and
   * rendering it produced three headings with one or two tiles under each. The
   * previous wizard flattened all of them under «امکانات» for exactly that
   * reason, and this keeps that.
   */
  const sorted = useMemo(
    () => [...grid].sort((a, b) => a.name.localeCompare(b.name, "fa")),
    [grid]
  );

  const [selected, setSelected] = useState<Record<number, Answer>>({});
  const [other, setOther] = useState("");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded || !draft) return;
    const next: Record<number, Answer> = {};
    (draft.amenities ?? []).forEach((row) => {
      next[row.amenityId] = (row.extraFeatures as Answer) ?? {};
    });
    setSelected(next);
    setOther(draft.otherAmenities ?? "");
    setSeeded(true);
  }, [draft, seeded]);

  const toggle = (id: number) => {
    setDirty(true);
    setSelected((previous) => {
      const next = { ...previous };
      if (id in next) delete next[id];
      else next[id] = {};
      return next;
    });
  };

  const setExtra = (id: number, field: string, value: string | boolean) => {
    setDirty(true);
    setSelected((previous) => ({
      ...previous,
      [id]: { ...previous[id], extra: { ...previous[id]?.extra, [field]: value } },
    }));
  };

  const count = Object.keys(selected).length;

  async function onNext() {
    const ok = await save(async (id) =>
      saveAmenities(id, {
        amenities: Object.entries(selected).map(([amenityId, answer]) => ({
          amenityId: Number(amenityId),
          extraFeatures: Object.keys(answer).length ? answer : undefined,
        })),
        other: other.trim() || undefined,
        step: progressMarker,
        // Without this, the classification written on step one is deleted.
        scopeIds: grid.map((a) => a.id),
      })
    );
    if (ok) {
      setDirty(false);
      next();
    }
  }

  if (isLoading || !seeded) return <StepSkeleton />;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      nextLabel={count === 0 ? "فعلاً رد کن" : "ذخیره و ادامه"}
      footerNote={
        count > 0 ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            {faDigits(count)} مورد انتخاب شده
          </p>
        ) : null
      }
    >
      <Section title="امکانات">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10">
          {sorted.map((amenity) => {
              const answer = selected[amenity.id];
              const isOn = !!answer;
              return (
                <CheckCard
                  key={amenity.id}
                  checked={isOn}
                  onToggle={() => toggle(amenity.id)}
                  label={amenity.name}
                  icon={amenity.iconUrl}
                >
                  {amenity.features.length > 0 && (
                    <div className="pt-10 border-t border-white/60 grid grid-cols-2 gap-x-10 gap-y-8">
                      {amenity.features.map((feature) => {
                        const current = answer?.extra?.[feature.name];
                        const options = (feature.values || "")
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean);

                        if (feature.fieldType?.toLowerCase() === "switch" ||
                            feature.fieldType?.toLowerCase() === "checkbox") {
                          return (
                            <label
                              key={feature.id}
                              className="flex items-center gap-x-6 text-12 font-l text-black"
                            >
                              <input
                                type="checkbox"
                                checked={current === true}
                                onChange={(e) => setExtra(amenity.id, feature.name, e.target.checked)}
                                className="w-16 h-16 accent-primary-main"
                              />
                              {feature.name}
                            </label>
                          );
                        }

                        if (options.length > 0) {
                          return (
                            <label key={feature.id} className="block col-span-2">
                              <span className="block text-12 font-m text-gray-77828F mb-4">
                                {feature.name}
                              </span>
                              <select
                                value={String(current ?? "")}
                                onChange={(e) => setExtra(amenity.id, feature.name, e.target.value)}
                                className="w-full h-[40px] px-12 rounded-10 border border-gray-DBDFE5 bg-white text-13 font-m text-black outline-none focus:border-primary-main"
                              >
                                <option value="">انتخاب کنید</option>
                                {options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        }

                        return (
                          <label key={feature.id} className="block col-span-2">
                            <span className="block text-12 font-m text-gray-77828F mb-4">
                              {feature.name}
                            </span>
                            <TextInput
                              value={String(current ?? "")}
                              onChange={(e) => setExtra(amenity.id, feature.name, e.target.value)}
                              placeholder={feature.placeholder || ""}
                              className="!h-[40px] !text-13"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </CheckCard>
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
    </StepLayout>
  );
}
