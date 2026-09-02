import React, { useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { saveSpecs } from "@/api/Residences/hostWizard";
import { getProvincesAndCities } from "@/api/address";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import { Callout, decimalOnly, Field, Section, Spinner, StepSkeleton, TextArea, TextInput } from "../ui";

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
 * The pin and the two coordinate boxes are the same pair of numbers reached
 * two ways. Some hosts know their coordinates and want to paste them; most
 * want to drag. Neither should be the only door.
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

  const lat = Number(values.latitude);
  if (values.latitude && (!Number.isFinite(lat) || lat < 24 || lat > 40)) {
    errors.latitude = "عرض جغرافیایی خارج از محدوده‌ی ایران است.";
  }
  const lng = Number(values.longitude);
  if (values.longitude && (!Number.isFinite(lng) || lng < 43 || lng > 64)) {
    errors.longitude = "طول جغرافیایی خارج از محدوده‌ی ایران است.";
  }
  return errors;
}

export default function AddressStep() {
  const { draft, residenceId, save, saveState, next, setDirty, progressMarker } = useWizard();

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

  const cities: { id: number; name: string }[] = useMemo(() => {
    const province = (provinces ?? []).find(
      (p: any) => String(p.id) === form.values.provinceId
    );
    return province?.cities ?? [];
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

  /** Centre the map on the chosen province the first time one is picked. */
  const flyTo = useMemo(() => {
    if (lat && lng) return undefined;
    const province = (provinces ?? []).find((p: any) => String(p.id) === form.values.provinceId);
    if (!province?.latitude || !province?.longitude) return undefined;
    return { lat: province.latitude, lng: province.longitude };
  }, [provinces, form.values.provinceId, lat, lng]);

  async function onNext() {
    if (!form.submit()) return;
    const ok = await save(
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
    if (ok) {
      setDirty(false);
      next();
    }
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
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
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
        description="نشانگر را بکشید یا روی نقشه بزنید. اگر مختصات را دارید، مستقیم وارد کنید."
      >
        <div className="rounded-16 overflow-hidden border border-gray-DBDFE5">
          <ProjectMap
            name="location"
            userLat={lat}
            userLang={lng}
            setUserLat={setLat as any}
            setUserLang={setLng as any}
            mapClassname="h-[300px] md:h-[360px] w-full"
            showZoomControl
            automaticallyNavigateToCustomLatLng={flyTo}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-16 mt-16">
          <Field label="عرض جغرافیایی" optionalNote error={form.visibleErrors.latitude}>
            {(props) => (
              <TextInput
                {...props}
                value={form.values.latitude}
                onChange={(e) => form.setField("latitude", decimalOnly(e.target.value))}
                onBlur={() => form.touch("latitude")}
                inputMode="decimal"
                dir="ltr"
                placeholder="36.9021"
                invalid={!!form.visibleErrors.latitude}
              />
            )}
          </Field>
          <Field label="طول جغرافیایی" optionalNote error={form.visibleErrors.longitude}>
            {(props) => (
              <TextInput
                {...props}
                value={form.values.longitude}
                onChange={(e) => form.setField("longitude", decimalOnly(e.target.value))}
                onBlur={() => form.touch("longitude")}
                inputMode="decimal"
                dir="ltr"
                placeholder="50.6739"
                invalid={!!form.visibleErrors.longitude}
              />
            )}
          </Field>
        </div>

        {!lat && !lng && (
          <Callout tone="info">
            بدون مختصات، اقامتگاه شما روی نقشه‌ی جست‌وجو دیده نمی‌شود. اجباری نیست، ولی توصیه
            می‌شود.
          </Callout>
        )}
      </Section>
    </StepLayout>
  );
}
