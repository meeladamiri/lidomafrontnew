import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Skeleton,
  faNum,
  parseCoord,
} from "@/components/Admin/ui";
import type { MapMarker } from "@/components/Admin/LocationPicker";

const LocationPicker = dynamic(() => import("@/components/Admin/LocationPicker"), { ssr: false });

/**
 * موقعیت مکانی — where the listing is, and what is around it.
 *
 * The map already existed, wedged into a 207px column of the «اطلاعات پایه»
 * sidebar. It worked; it was simply too small to aim with. Everything about
 * placing a listing now lives here at a size you can actually use.
 *
 * ## Two ways to set the same thing
 *
 * A pin is dragged when you recognise the street, and typed when someone sends
 * you coordinates. Both write the same two fields, and neither is the lesser
 * path: the inputs update the map as you type, the map fills the inputs as you
 * click.
 *
 * Typed coordinates go through `parseCoord`, not `parseNum` — the latter
 * strips the decimal point and turns 35.6892 into 356892, which is a pin in
 * the Indian Ocean.
 *
 * ## "Nearby" is two different claims
 *
 * The catalogue has 18,448 places and coordinates on 720. So a suggestion is
 * either a real distance (both ends have coordinates) or merely the same city
 * — and the panel says which, because «۳ کیلومتر» and «در همین شهر» are
 * different promises to make to a guest.
 */

interface Distance {
  id: number;
  placeName: string;
  distance: string | null;
  eta: string | null;
  sortOrder: number;
  attraction: { id: number; name: string; latitude: number | null; longitude: number | null } | null;
}

interface Nearby {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  distanceKm: number | null;
  distanceText: string | null;
  alreadyAdded: boolean;
}

interface Residence {
  id: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  invoiceAddress: string | null;
  neighborhood: string | null;
  location: { id: number; name: string; parent: { name: string } | null } | null;
}

export default function LocationTab({
  residenceId,
  residence,
  onSaved,
}: {
  residenceId: number;
  residence: Residence;
  onSaved: () => void;
}) {
  const [lat, setLat] = useState<number | null>(residence.latitude);
  const [lng, setLng] = useState<number | null>(residence.longitude);
  const [latText, setLatText] = useState(residence.latitude?.toString() ?? "");
  const [lngText, setLngText] = useState(residence.longitude?.toString() ?? "");
  const [radiusKm, setRadiusKm] = useState(30);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // manual add
  const [newPlace, setNewPlace] = useState("");
  const [newDistance, setNewDistance] = useState("");
  const [newEta, setNewEta] = useState("");

  const { data: distances, mutate: reloadDistances } = useSWR<Distance[]>(
    `/api/admin/residences/${residenceId}/distances`,
    (p: string) => apiFetch<Distance[]>(p)
  );

  const { data: nearby, mutate: reloadNearby } = useSWR<{ mode: string; items: Nearby[] }>(
    `/api/admin/residences/${residenceId}/nearby-attractions?radiusKm=${radiusKm}&limit=30`,
    (p: string) => apiFetch<{ mode: string; items: Nearby[] }>(p)
  );

  const dirty = lat !== residence.latitude || lng !== residence.longitude;

  const markers: MapMarker[] = useMemo(
    () =>
      (nearby?.items ?? [])
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => ({
          id: a.id,
          name: a.name,
          latitude: a.latitude!,
          longitude: a.longitude!,
          note: a.distanceText,
        })),
    [nearby]
  );

  function pinTo(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    setLatText(newLat.toFixed(7));
    setLngText(newLng.toFixed(7));
    setNote(null);
  }

  async function run(key: string, fn: () => Promise<unknown>, done: string) {
    setBusy(key);
    setError(null);
    setNote(null);
    try {
      await fn();
      setNote(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : "انجام نشد");
    } finally {
      setBusy(null);
    }
  }

  const withDistance = (nearby?.items ?? []).filter((a) => a.distanceKm != null);
  const cityOnly = (nearby?.items ?? []).filter((a) => a.distanceKm == null);

  return (
    <div className="flex flex-col gap-y-16">
      {/* ---------------- map + coordinates ---------------- */}
      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-12">
          <h3 className="text-16 leading-24 font-m text-black">موقعیت روی نقشه</h3>
          {lat != null && lng != null && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-13 text-primary-dark font-m"
            >
              باز کردن در گوگل مپ ↗
            </a>
          )}
        </div>

        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={pinTo}
          height="h-[460px]"
          markers={markers}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-10 items-end mt-14">
          <Field label="عرض جغرافیایی (Latitude)">
            <Input
              value={latText}
              onChange={(e) => {
                setLatText(e.target.value);
                const v = parseCoord(e.target.value);
                if (v != null && v >= -90 && v <= 90) setLat(v);
              }}
              placeholder="۳۵٫۶۸۹۲"
              inputMode="decimal"
            />
          </Field>
          <Field label="طول جغرافیایی (Longitude)">
            <Input
              value={lngText}
              onChange={(e) => {
                setLngText(e.target.value);
                const v = parseCoord(e.target.value);
                if (v != null && v >= -180 && v <= 180) setLng(v);
              }}
              placeholder="۵۱٫۳۸۹۰"
              inputMode="decimal"
            />
          </Field>
          <div className="flex items-center gap-x-8">
            <Button
              disabled={!dirty || busy === "coords" || lat == null || lng == null}
              onClick={() =>
                run(
                  "coords",
                  async () => {
                    await apiFetch(`/api/admin/residences/${residenceId}`, {
                      method: "PATCH",
                      body: JSON.stringify({ latitude: lat, longitude: lng }),
                    });
                    onSaved();
                    reloadNearby();
                  },
                  "موقعیت ذخیره شد"
                )
              }
            >
              {busy === "coords" ? "در حال ذخیره…" : "ذخیره موقعیت"}
            </Button>
            {dirty && (
              <Button
                variant="secondary"
                onClick={() => {
                  setLat(residence.latitude);
                  setLng(residence.longitude);
                  setLatText(residence.latitude?.toString() ?? "");
                  setLngText(residence.longitude?.toString() ?? "");
                }}
              >
                بازگردانی
              </Button>
            )}
          </div>
        </div>

        {dirty && (
          <p className="mt-8 text-12 leading-20 text-[#B26A00]">
            موقعیت تغییر کرده و هنوز ذخیره نشده.
          </p>
        )}
        {!!note && <p className="mt-8 text-13 leading-20 text-[#2E7D32]">{note}</p>}
        {!!error && <p className="mt-8 text-13 leading-20 text-[#C62828]">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16 pt-16 border-t border-gray-F0F0F0">
          <div>
            <p className="text-12 leading-20 text-gray-6C6A7D">استان</p>
            <p className="text-13 leading-22 text-black">{residence.location?.parent?.name || "—"}</p>
          </div>
          <div>
            <p className="text-12 leading-20 text-gray-6C6A7D">شهر</p>
            <p className="text-13 leading-22 text-black">{residence.location?.name || "—"}</p>
          </div>
          <div>
            <p className="text-12 leading-20 text-gray-6C6A7D">محله</p>
            <p className="text-13 leading-22 text-black">{residence.neighborhood || "—"}</p>
          </div>
          <div>
            <p className="text-12 leading-20 text-gray-6C6A7D">آدرس</p>
            <p className="text-13 leading-22 text-black break-words">{residence.address || "—"}</p>
          </div>
        </div>
        <p className="mt-8 text-11 leading-18 text-gray-9B9BAA">
          استان، شهر و آدرس از «ویرایش یکجا اطلاعات» در تب اطلاعات پایه تغییر می‌کنند.
        </p>
      </Card>

      {/* ---------------- nearby suggestions ---------------- */}
      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-4">
          <h3 className="text-16 leading-24 font-m text-black">جاذبه‌های نزدیک</h3>
          <div className="flex items-center gap-x-8">
            <span className="text-12 text-gray-6C6A7D">شعاع</span>
            {[10, 30, 60].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={`rounded-8 border px-10 py-4 text-12 leading-18 ${
                  radiusKm === r
                    ? "border-primary-main text-primary-dark bg-primary-light"
                    : "border-gray-E5E5E6 text-gray-6C6A7D"
                }`}
              >
                {faNum(r)} کیلومتر
              </button>
            ))}
          </div>
        </div>

        {residence.latitude == null && (
          <div className="rounded-10 bg-[#FFF8EC] border border-[#F5D9A8] px-12 py-10 mb-12">
            <p className="text-12 leading-20 text-black">
              این اقامتگاه موقعیت روی نقشه ندارد، پس فاصله‌ی واقعی قابل محاسبه نیست. فعلاً فقط
              جاذبه‌های همان شهر پیشنهاد می‌شوند.
            </p>
          </div>
        )}

        {!nearby ? (
          <Skeleton className="h-[160px]" />
        ) : nearby.items.length === 0 ? (
          <EmptyState text="جاذبه‌ای برای این اقامتگاه پیدا نشد" />
        ) : (
          <>
            {withDistance.length > 0 && (
              <>
                <p className="text-12 leading-20 text-gray-6C6A7D mb-8">
                  با فاصله‌ی محاسبه‌شده — هم اقامتگاه و هم جاذبه مختصات دارند
                </p>
                <div className="flex flex-col gap-y-6 mb-14">
                  {withDistance.map((a) => (
                    <Row
                      key={a.id}
                      a={a}
                      checked={picked.has(a.id)}
                      onToggle={() =>
                        setPicked((prev) => {
                          const n = new Set(prev);
                          n.has(a.id) ? n.delete(a.id) : n.add(a.id);
                          return n;
                        })
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {cityOnly.length > 0 && (
              <>
                <p className="text-12 leading-20 text-gray-6C6A7D mb-8">
                  در همین شهر — این‌ها مختصات ندارند، پس فاصله‌شان محاسبه نشده و باید دستی نوشته
                  شود
                </p>
                <div className="flex flex-col gap-y-6 mb-14">
                  {cityOnly.slice(0, 12).map((a) => (
                    <Row
                      key={a.id}
                      a={a}
                      checked={picked.has(a.id)}
                      onToggle={() =>
                        setPicked((prev) => {
                          const n = new Set(prev);
                          n.has(a.id) ? n.delete(a.id) : n.add(a.id);
                          return n;
                        })
                      }
                    />
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center gap-x-10">
              <Button
                disabled={picked.size === 0 || busy === "bulk"}
                onClick={() =>
                  run(
                    "bulk",
                    async () => {
                      await apiFetch(`/api/admin/residences/${residenceId}/distances/bulk`, {
                        method: "POST",
                        body: JSON.stringify({ attractionIds: [...picked] }),
                      });
                      setPicked(new Set());
                      reloadDistances();
                      reloadNearby();
                    },
                    "جاذبه‌های انتخاب‌شده اضافه شدند"
                  )
                }
              >
                افزودن {picked.size > 0 ? faNum(picked.size) : ""} مورد انتخاب‌شده
              </Button>
              {withDistance.filter((a) => !a.alreadyAdded).length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setPicked(
                      new Set(withDistance.filter((a) => !a.alreadyAdded).slice(0, 8).map((a) => a.id))
                    )
                  }
                >
                  انتخاب ۸ مورد نزدیک
                </Button>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ---------------- current list ---------------- */}
      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-4">
          فاصله تا جاذبه‌های گردشگری
          {!!distances?.length && (
            <span className="mr-8">
              <Badge tone="gray">{faNum(distances.length)}</Badge>
            </span>
          )}
        </h3>
        <p className="text-11 leading-18 text-gray-9B9BAA mb-12">
          این فهرست در صفحه‌ی عمومی اقامتگاه نمایش داده می‌شود.
        </p>

        {!distances ? (
          <Skeleton className="h-[120px]" />
        ) : distances.length === 0 ? (
          <EmptyState text="فاصله‌ای ثبت نشده" />
        ) : (
          <div className="flex flex-col gap-y-8 mb-16">
            {distances.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-x-12 flex-wrap gap-y-6 rounded-10 border border-gray-E5E5E6 px-12 py-10"
              >
                <div className="min-w-0">
                  <p className="text-14 leading-22 text-black">
                    {d.placeName}
                    {!d.attraction && (
                      <span className="mr-8 text-11 text-gray-9B9BAA">(متن آزاد)</span>
                    )}
                  </p>
                  <p className="text-12 leading-20 text-gray-6C6A7D">
                    {d.distance || "بدون فاصله"}
                    {d.eta ? ` · ${d.eta}` : ""}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={busy === `del-${d.id}`}
                  onClick={() =>
                    run(
                      `del-${d.id}`,
                      async () => {
                        await apiFetch(`/api/admin/distances/${d.id}`, { method: "DELETE" });
                        reloadDistances();
                        reloadNearby();
                      },
                      "حذف شد"
                    )
                  }
                >
                  حذف
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* manual add */}
        <div className="rounded-12 border border-gray-E5E5E6 p-14">
          <p className="text-13 leading-22 font-m text-black mb-10">افزودن دستی</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Field label="نام مکان">
              <Input
                value={newPlace}
                onChange={(e) => setNewPlace(e.target.value)}
                placeholder="مثلاً پل خواجو"
              />
            </Field>
            <Field label="فاصله">
              <Input
                value={newDistance}
                onChange={(e) => setNewDistance(e.target.value)}
                placeholder="۳٫۵ کیلومتر"
              />
            </Field>
            <Field label="زمان رسیدن">
              <Input
                value={newEta}
                onChange={(e) => setNewEta(e.target.value)}
                placeholder="۱۲ دقیقه"
              />
            </Field>
          </div>
          <div className="mt-10">
            <Button
              disabled={!newPlace.trim() || busy === "add"}
              onClick={() =>
                run(
                  "add",
                  async () => {
                    await apiFetch(`/api/admin/residences/${residenceId}/distances`, {
                      method: "POST",
                      body: JSON.stringify({
                        placeName: newPlace.trim(),
                        distance: newDistance.trim() || undefined,
                        eta: newEta.trim() || undefined,
                      }),
                    });
                    setNewPlace("");
                    setNewDistance("");
                    setNewEta("");
                    reloadDistances();
                  },
                  "اضافه شد"
                )
              }
            >
              افزودن
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({
  a,
  checked,
  onToggle,
}: {
  a: Nearby;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-x-12 rounded-10 border px-12 py-8 cursor-pointer ${
        a.alreadyAdded
          ? "border-gray-E5E5E6 bg-gray-F7F7F7 opacity-70"
          : checked
            ? "border-primary-main bg-primary-light"
            : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
      }`}
    >
      <span className="flex items-center gap-x-10 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={a.alreadyAdded}
          onChange={onToggle}
          className="w-16 h-16 shrink-0"
        />
        <span className="min-w-0">
          <span className="block text-14 leading-22 text-black truncate">{a.name}</span>
          {!!a.locationName && (
            <span className="block text-11 leading-16 text-gray-9B9BAA">{a.locationName}</span>
          )}
        </span>
      </span>
      <span className="text-12 leading-20 shrink-0">
        {a.alreadyAdded ? (
          <span className="text-gray-9B9BAA">قبلاً اضافه شده</span>
        ) : a.distanceText ? (
          <span className="text-primary-dark font-m">{a.distanceText}</span>
        ) : (
          <span className="text-gray-9B9BAA">در همین شهر</span>
        )}
      </span>
    </label>
  );
}
