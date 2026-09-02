import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import {
  createDraft,
  getClassification,
  getClassificationOptions,
  saveClassification,
  saveSpecs,
  type ResidenceTypeCode,
} from "@/api/Residences/hostWizard";
import { getWizardContent } from "@/api/Residences/getWizardContent";
import { StepLayout } from "../Shell";
import { legacyStep } from "../steps";
import { useWizard } from "../useWizard";
import { Callout, OptionCard, Section, StepSkeleton } from "../ui";

/**
 * Step one: what kind of place is this, and where does it sit.
 *
 * Both answers are amenity-backed taxonomies — the same two the admin panel's
 * «دسته‌بندی اقامتگاه» edits, and the same two `seo_tag_conditions` matches on.
 * The previous wizard asked the region question and wrote the answer to
 * `residence.region`, a column nothing reads, so listings created by hosts
 * were absent from every tag page built out of it.
 *
 * The pictures come from the wizard content the panel configures, matched to
 * an option by name. An option with no configured picture still renders — it
 * just gets the plain tile.
 */

/**
 * The residence row's own `type` enum, which is not this question.
 *
 * It is a coarse three-value column (سوئیت / بوم‌گردی / هتل) driving URLs and
 * copy, while the taxonomy above is the fine one (ویلا، آپارتمان، کلبه…). One
 * question is enough to ask a host, so the enum is inferred and an admin can
 * retype it from the detail page. Inference is deliberately narrow: anything
 * unrecognised is a suite, which is what 8,319 of 9,574 listings are.
 */
function inferTypeCode(values: string[]): ResidenceTypeCode {
  const joined = values.join(" ");
  if (joined.includes("بوم")) return "BOOMGARDI";
  if (joined.includes("هتل")) return "HOTEL";
  return "SUIT";
}

export default function DetailsStep() {
  const router = useRouter();
  const { residenceId, draft, save, saveState, next, setDirty, progressMarker } = useWizard();
  const [types, setTypes] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();

  // Options do not depend on the listing, so they are shared across every host
  // and cached for the session.
  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ["classificationOptions"],
    queryFn: async () => {
      const res = await getClassificationOptions();
      return res.ok ? res.data.fields : [];
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: content } = useQuery({
    queryKey: ["wizardContent"],
    queryFn: getWizardContent,
    staleTime: 30 * 60 * 1000,
  });

  // What this listing already answers, when there is a listing.
  const { data: current } = useQuery({
    queryKey: ["classification", residenceId],
    queryFn: async () => {
      const res = await getClassification(residenceId as number);
      return res.ok ? res.data.fields : [];
    },
    enabled: !!residenceId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (seeded || !current) return;
    setTypes(current.find((f) => f.key === "type")?.selected ?? []);
    setAreas(current.find((f) => f.key === "area")?.selected ?? []);
    setSeeded(true);
  }, [current, seeded]);

  const typeField = options?.find((f) => f.key === "type");
  const areaField = options?.find((f) => f.key === "area");

  /**
   * Panel-configured artwork, matched by name; missing is fine.
   *
   * `/assets/res-placeholder.jpg` is the sentinel the old option lists shipped
   * with — it renders as a grey broken-image glyph, which is worse than no
   * picture at all, so it counts as "none".
   */
  const imageFor = useMemo(() => {
    const map = new Map<string, string>();
    const usable = (url: string | null) => !!url && !url.includes("res-placeholder");
    (content?.options?.RES_TYPE ?? []).forEach((o) => usable(o.image_url) && map.set(o.name, o.image_url as string));
    (content?.options?.REGION ?? []).forEach((o) => usable(o.image_url) && map.set(o.name, o.image_url as string));
    return (name: string) => map.get(name) ?? null;
  }, [content]);

  // A group either shows pictures or it does not. One configured image among
  // eight would otherwise leave a single tall tile beside seven short ones.
  const groupHasArt = (options: string[] | undefined) =>
    (options ?? []).some((option) => !!imageFor(option));

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setDirty(true);
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const canContinue = types.length > 0 && areas.length > 0;

  async function persist(id: number) {
    const before = {
      type: current?.find((f) => f.key === "type")?.selected ?? [],
      area: current?.find((f) => f.key === "area")?.selected ?? [],
    };
    const same = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v) => b.includes(v));

    // Only what actually changed. Re-saving an untouched answer writes an
    // activity-log line saying nothing changed, on a page an admin reads.
    const writes: Promise<unknown>[] = [];
    if (!same(before.type, types)) writes.push(saveClassification(id, "type", types));
    if (!same(before.area, areas)) writes.push(saveClassification(id, "area", areas));
    await Promise.all(writes);
  }

  async function onNext() {
    if (!canContinue) return;

    // First visit: mint the listing the rest of the wizard is keyed by.
    if (!residenceId) {
      setCreating(true);
      setCreateError(undefined);
      const created = await createDraft({ type: inferTypeCode(types) });
      setCreating(false);
      if (!created.ok) {
        setCreateError(created.message);
        return;
      }
      await persist(created.data.id);
      // The legacy column is kept in step with the real answer so the panel's
      // «اطلاعات پایه» row does not contradict the classification card.
      await saveSpecs(created.data.id, { region: areas.join("، "), step: legacyStep(0) });
      setDirty(false);
      router.replace(
        { pathname: router.pathname, query: { step: "1", productId: String(created.data.id) } },
        undefined,
        { shallow: true }
      );
      return;
    }

    const saved = await save(async (id) => {
      await persist(id);
      return saveSpecs(id, { region: areas.join("، "), step: progressMarker });
    });
    if (saved) {
      setDirty(false);
      next();
    }
  }

  if (optionsLoading || (residenceId && !seeded)) return <StepSkeleton />;

  const nothingConfigured = !typeField?.options.length && !areaField?.options.length;

  return (
    <StepLayout
      onNext={onNext}
      nextLabel={residenceId ? "ذخیره و ادامه" : "شروع کنیم"}
      nextDisabled={!canContinue || nothingConfigured}
      busy={creating || saveState === "saving"}
      footerNote={
        !canContinue && !nothingConfigured ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            برای ادامه، یک نوع و یک منطقه انتخاب کنید.
          </p>
        ) : createError ? (
          <Callout tone="error">{createError}</Callout>
        ) : null
      }
    >
      {nothingConfigured ? (
        <Callout tone="warning">
          هنوز دسته‌بندی‌ای در سامانه تعریف نشده است. لطفاً با پشتیبانی تماس بگیرید.
        </Callout>
      ) : (
        <>
          <Section
            title={typeField?.name || "نوع اقامتگاه"}
            description="اگر بیش از یک مورد صدق می‌کند، هر دو را انتخاب کنید."
          >
            <div className="grid grid-cols-2 gap-12">
              {(typeField?.options ?? []).map((option) => (
                <OptionCard
                  key={option}
                  title={option}
                  imageUrl={imageFor(option)}
                  reserveMedia={groupHasArt(typeField?.options)}
                  icon="icon-Home"
                  selected={types.includes(option)}
                  onSelect={() => toggle(types, setTypes, option)}
                />
              ))}
            </div>
          </Section>

          <Section
            title={areaField?.name || "منطقه اقامتگاه"}
            description="مهمان‌ها اغلب دقیقاً بر همین اساس جست‌وجو می‌کنند."
          >
            <div className="grid grid-cols-2 gap-12">
              {(areaField?.options ?? []).map((option) => (
                <OptionCard
                  key={option}
                  title={option}
                  imageUrl={imageFor(option)}
                  reserveMedia={groupHasArt(areaField?.options)}
                  icon="icon-Map"
                  selected={areas.includes(option)}
                  onSelect={() => toggle(areas, setAreas, option)}
                />
              ))}
            </div>
          </Section>

          {draft && draft.state !== "DRAFT" && (
            <Callout tone="info">
              این اقامتگاه قبلاً ثبت شده است. تغییرات شما پس از بررسی کارشناس اعمال می‌شود.
            </Callout>
          )}
        </>
      )}
    </StepLayout>
  );
}
