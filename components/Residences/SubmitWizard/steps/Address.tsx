import React, { useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { saveSpecs } from "@/api/Residences/hostWizard";
import { getProvincesAndCities } from "@/api/address";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import { Callout, Field, Section, Spinner, StepSkeleton, TextArea, TextInput } from "../ui";

const ProjectMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-16 bg-gray-F3F5F7 grid place-items-center">
      <Spinner />
    </div>
  ),
});

/**
 * Step three: where it is.
 *
 * The city goes by name and the server resolves it. Looking the id up here
 * first put a second serial round trip in front of every address save, on the
 * step where a host is already typing the most.
 *
 * The pin is the only way to set the location. There were coordinate boxes
 * beside it; they are gone. A host dropping a pin on their own house has no
 * use for reading 36.9021 back, and a pair of number fields next to a map is
 * an invitation to type into them and end up somewhere else.
 */

interface Values {
  provinceId: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: string;
  longitude: string;
}

const ADDRESS_MIN = 10;

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.provinceId) errors.provinceId = "استان را انتخاب کنید.";
  if (!values.city) errors.city = "شهر را انتخاب کنید.";

  const address = values.address.trim();
  if (!address) errors.address = "نشانی اقامتگاه را وارد کنید.";
  else if (address.length < ADDRESS_MIN) errors.address = "نشانی کامل‌تری وارد کنید.";

  // No coordinate validation: the only thing that can set these is the map,
  // and a pin cannot land outside the world. The backend range check stays,
  // because it is the boundary and this is not the only caller.
  return errors;
}

export default function AddressStep() {
  const { draft, residenceId, commit, saveState, next, setDirty, progressMarker } = useWizard();

  const { data: provinces, isLoading: provincesLoading } = useQuery({
    queryKey: ["provincesAndCities"],
    queryFn: async () => {
      const res = await getProvincesAndCities();
      return res?.status === "success" ? res.params.states : [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const initial = useMemo<Values | undefined>(() => {
    if (!draft) return undefined;
    return {
      provinceId: draft.location?.parent?.id ? String(draft.location.parent.id) : "",
      city: draft.location?.name ?? "",
      neighborhood: draft.neighborhood ?? "",
      address: draft.address ?? "",
      latitude: draft.latitude != null ? String(draft.latitude) : "",
      longitude: draft.longitude != null ? String(draft.longitude) : "",
    };
  }, [draft]);

  const form = useStepForm<Values>({
    initial,
    validate,
    rescueKey: residenceId ? `lidoma:wizard:${residenceId}:address` : undefined,
  });

  useEffect(() => {
    setDirty(form.dirty);
  }, [form.dirty, setDirty]);

  /**
   * The city names of the selected province.
   *
   * `/api/search/provinces` returns `cities` as an array of **strings**, not
   * objects. Reading `.name` off each one produced a list of empty options —
   * a dropdown that opened onto nothing. The response is typed `any` at the
   * api layer, so the compiler had no way to say so.
   *
   * The object branch is kept because two other callers of this endpoint index
   * it differently, and a silently empty list is exactly the failure worth
   * being defensive about.
   */
  const cities: string[] = useMemo(() => {
    const province = (provinces ?? []).find((p: any) => String(p.id) === form.values.provinceId);
    return (province?.cities ?? [])
      .map((city: any) => (typeof city === "string" ? city : city?.name ?? ""))
      .filter(Boolean);
  }, [provinces, form.values.provinceId]);

  // The map talks in numbers; the form stores strings so a half-typed value is
  // not thrown away mid-keystroke.
  const lat = form.values.latitude ? Number(form.values.latitude) : undefined;
  const lng = form.values.longitude ? Number(form.values.longitude) : undefined;

  const setLat = useCallback(
    (value: any) => {
      const next = typeof value === "function" ? value(lat) : value;
      form.setField("latitude", next == null ? "" : String(next));
    },
    [form, lat]
  );
  const setLng = useCallback(
    (value: any) => {
      const next = typeof value === "function" ? value(lng) : value;
      form.setField("longitude", next == null ? "" : String(next));
    },
    [form, lng]
  );

  /**
   * Where the map opens.
   *
   * Centred on the chosen province rather than on the whole country — the
   * host has already said roughly where they are, so making them zoom in from
   * Iran is asking a question twice.
   *
   * Province, not city: no city in the estate has coordinates (0 of 519), so
   * there is nothing to centre on at that level yet. Backfilling city
   * coordinates would let this get one step closer.
   */
  const province = useMemo(
    () => (provinces ?? []).find((p: any) => String(p.id) === form.values.provinceId),
    [provinces, form.values.provinceId]
  );

  const flyTo = useMemo(() => {
    if (lat && lng) return undefined;
    if (!province?.latitude || !province?.longitude) return undefined;
    return { lat: province.latitude, lng: province.longitude };
  }, [province, lat, lng]);

  async function onNext() {
    if (!form.submit()) return;
    commit(
      async (id) => {
        const result = await saveSpecs(id, {
          cityName: form.values.city || undefined,
          neighborhood: form.values.neighborhood.trim(),
          address: form.values.address.trim(),
          // Invoices need the full postal address; the public page shows only
          // the approximate area until a booking is confirmed.
          invoiceAddress: form.values.address.trim(),
          latitude: form.values.latitude ? Number(form.values.latitude) : undefined,
          longitude: form.values.longitude ? Number(form.values.longitude) : undefined,
          step: progressMarker,
        });
        if (result.ok) form.markSaved();
        else if (result.fieldErrors) form.setServerErrors(result.fieldErrors);
        return result;
      },
      // The city was sent by name; only a re-read tells us what it resolved to.
      { reload: true }
    );
    setDirty(false);
    next();
  }

  if (!form.ready || provincesLoading) return <StepSkeleton />;

  return (
    <StepLayout onNext={onNext} busy={saveState === "saving"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-16">
        <Field label="استان" required error={form.visibleErrors.provinceId}>
          {(props) => (
            <select
              {...props}
              value={form.values.provinceId}
              onChange={(e) => {
                form.setField("provinceId", e.target.value);
                // A city from the previous province is worse than no city.
                form.setField("city", "");
              }}
              onBlur={() => form.touch("provinceId")}
              className={`w-full h-[52px] px-16 rounded-12 bg-white border text-14 font-m text-black outline-none appearance-none cursor-pointer transition-colors focus:border-primary-main focus:ring-2 focus:ring-primary-light ${
                form.visibleErrors.provinceId ? "border-error-light" : "border-gray-DBDFE5"
              }`}
            >
              <option value="">انتخاب کنید</option>
              {(provinces ?? []).map((p: any) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          label="شهر"
          required
          error={form.visibleErrors.city}
          hint={!form.values.provinceId ? "ابتدا استان را انتخاب کنید." : undefined}
        >
          {(props) => (
            <select
              {...props}
              value={form.values.city}
              disabled={!form.values.provinceId}
              onChange={(e) => form.setField("city", e.target.value)}
              onBlur={() => form.touch("city")}
              className={`w-full h-[52px] px-16 rounded-12 bg-white border text-14 font-m text-black outline-none appearance-none cursor-pointer transition-colors disabled:bg-gray-F7F7F7 disabled:cursor-not-allowed focus:border-primary-main focus:ring-2 focus:ring-primary-light ${
                form.visibleErrors.city ? "border-error-light" : "border-gray-DBDFE5"
              }`}
            >
              <option value="">انتخاب کنید</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field label="محله" optionalNote error={form.visibleErrors.neighborhood}>
        {(props) => (
          <TextInput
            {...props}
            value={form.values.neighborhood}
            onChange={(e) => form.setField("neighborhood", e.target.value)}
            onBlur={() => form.touch("neighborhood")}
            placeholder="مثلاً: سادات‌شهر"
            invalid={!!form.visibleErrors.neighborhood}
          />
        )}
      </Field>

      <Field
        label="نشانی کامل"
        required
        hint="خیابان، کوچه و پلاک. فقط پس از قطعی‌شدن رزرو به مهمان نشان داده می‌شود."
        error={form.visibleErrors.address}
      >
        {(props) => (
          <TextArea
            {...props}
            value={form.values.address}
            onChange={(e) => form.setField("address", e.target.value)}
            onBlur={() => form.touch("address")}
            rows={3}
            placeholder="خیابان اصلی، کوچه‌ی سوم، پلاک ۱۲"
            invalid={!!form.visibleErrors.address}
          />
        )}
      </Field>

      <Section
        title="محل دقیق روی نقشه"
        description="روی نقشه بزنید یا نشانگر را بکشید تا محل دقیق اقامتگاه مشخص شود."
      >
        {/*
          The height lives here, not on the map.

          ProjectMap renders its container with an inline `height: 100%`, which
          beats any Tailwind class passed as `mapClassname` — so the map is
          exactly as tall as whatever wraps it. Given a wrapper with no height
          of its own, it resolves to zero and the map is invisible while every
          other part of the step looks fine.
        */}
        <div className="h-[320px] md:h-[400px] rounded-16 overflow-hidden border border-gray-DBDFE5">
          <ProjectMap
            name="location"
            userLat={lat}
            userLang={lng}
            setUserLat={setLat as any}
            setUserLang={setLng as any}
            mapClassname="w-full h-full"
            showZoomControl
            automaticallyNavigateToCustomLatLng={flyTo}
          />
        </div>

        {/*
          The coordinates themselves are not shown. They are a machine detail —
          a host who has just dropped a pin on their own house does not need to
          read back 36.9021, and a pair of number boxes next to a map invites
          someone to type into them and end up somewhere else.
        */}
        <div className="mt-12">
          {lat && lng ? (
            <div className="flex items-center justify-between gap-x-12 rounded-12 border border-primary-main bg-primary-light/30 px-14 py-12">
              <span className="flex items-center gap-x-8 text-13 font-m text-black">
                <i className="icon-LocationFill text-16 text-primary-dark" />
                محل روی نقشه مشخص شد
              </span>
              <button
                type="button"
                onClick={() => {
                  form.setField("latitude", "");
                  form.setField("longitude", "");
                }}
                className="shrink-0 text-12 font-m text-gray-77828F underline"
              >
                حذف نشانگر
              </button>
            </div>
          ) : (
            <Callout tone="info">
              بدون مشخص‌کردن محل روی نقشه، اقامتگاه شما در جست‌وجوی نقشه‌ای دیده نمی‌شود. اجباری
              نیست، ولی توصیه می‌شود.
            </Callout>
          )}
        </div>
      </Section>
    </StepLayout>
  );
}
