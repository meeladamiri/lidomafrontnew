import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, Modal, Skeleton, Toggle, faNum } from "@/components/Admin/ui";

/**
 * «امکانات».
 *
 * 42 amenities, 36 of them in a single category, and 22 carrying sub-answers —
 * the pool's size, the parking's capacity, how many blankets. The previous
 * grid put all of them on screen as bare checkboxes and hid every sub-answer
 * behind a modal reached by a small text link, so the tab could say *whether*
 * a listing had a pool and never what kind, and finding one item meant reading
 * all forty-two.
 *
 * Three things fix that: a search box, a filter for what is already on, and
 * the sub-answers printed under the name where they can be read.
 *
 * The save panel names what is about to change. This screen writes by
 * replacing, and a button that says only «ذخیره» gives nobody the chance to
 * notice a row toggled by accident.
 */

export interface AmenityFeatureDef {
  id: number;
  name: string;
  fieldType: "TEXT" | "DROPDOWN" | "SWITCH" | "CHECKBOX";
  placeholder: string | null;
  values: string | null; // comma-separated options
}

export interface CatalogAmenity {
  id: number;
  key: string | null;
  name: string;
  category: string | null;
  iconUrl: string | null;
  features: AmenityFeatureDef[];
}

export interface ResidenceAmenityRow {
  amenity: { id: number };
  extraFeatures: { value?: string; extra?: Record<string, string> } | null;
}

type Entry = { checked: boolean; extra: Record<string, string>; value?: string };
type Selection = Record<number, Entry>;

/** Categorical attributes live on the basic tab — see ClassificationCard. */
const CLASSIFICATION_KEYS = ["type", "area", "rent-type"];

export default function AmenitiesTab({
  residenceId,
  amenities,
  otherAmenities,
  onSaved,
}: {
  residenceId: number;
  amenities: ResidenceAmenityRow[];
  otherAmenities: string | null;
  onSaved: () => void;
}) {
  const { data: catalog, isLoading } = useSWR<CatalogAmenity[]>(
    "/api/admin/amenities",
    (p: string) => apiFetch<CatalogAmenity[]>(p)
  );

  const initial: Selection = useMemo(() => {
    const sel: Selection = {};
    for (const a of amenities) {
      sel[a.amenity.id] = {
        checked: true,
        extra: a.extraFeatures?.extra ?? {},
        // The migrated answer, kept as-is. Stamping «دارد» on every amenity
        // threw away values like «دربست» that came from Odoo.
        value: a.extraFeatures?.value ?? "دارد",
      };
    }
    return sel;
  }, [amenities]);

  const [selection, setSelection] = useState<Selection>(initial);
  const [other, setOther] = useState(otherAmenities ?? "");
  const [featureFor, setFeatureFor] = useState<CatalogAmenity | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "on" | "off">("all");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the listing reloads after a save, otherwise the grid keeps
  // showing what was on screen before the write rather than what was stored.
  useEffect(() => {
    setSelection(initial);
  }, [initial]);

  useEffect(() => {
    setOther(otherAmenities ?? "");
  }, [otherAmenities]);

  const managed = useMemo(
    () => (catalog ?? []).filter((a) => !CLASSIFICATION_KEYS.includes(a.key ?? "")),
    [catalog]
  );

  const grouped = useMemo(() => {
    const needle = q.trim();
    const byCategory = new Map<string, CatalogAmenity[]>();

    for (const a of managed) {
      if (needle && !a.name.includes(needle)) continue;
      const on = !!selection[a.id]?.checked;
      if (filter === "on" && !on) continue;
      if (filter === "off" && on) continue;

      const cat = a.category || "سایر";
      byCategory.set(cat, [...(byCategory.get(cat) ?? []), a]);
    }
    return [...byCategory.entries()];
  }, [managed, q, filter, selection]);

  const onCount = managed.filter((a) => selection[a.id]?.checked).length;
  const shown = grouped.reduce((n, [, list]) => n + list.length, 0);

  // What this save would change, against what was loaded.
  const added = managed.filter((a) => selection[a.id]?.checked && !initial[a.id]?.checked);
  const removed = managed.filter((a) => !selection[a.id]?.checked && initial[a.id]?.checked);
  const otherChanged = other !== (otherAmenities ?? "");
  const dirty = added.length > 0 || removed.length > 0 || otherChanged;

  function toggle(id: number) {
    setSelection((s) => ({
      ...s,
      [id]: { checked: !s[id]?.checked, extra: s[id]?.extra ?? {}, value: s[id]?.value },
    }));
    setSavedAt(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/amenities`, {
        method: "PATCH",
        body: JSON.stringify({
          amenities: managed
            .filter((a) => selection[a.id]?.checked)
            .map((a) => {
              const v = selection[a.id];
              return {
                amenityId: a.id,
                extraFeatures: {
                  value: v.value ?? "دارد",
                  ...(Object.keys(v.extra).length ? { extra: v.extra } : {}),
                },
              };
            }),
          other: other || undefined,
          // What this grid is responsible for. Without it the save replaced
          // every amenity with what the grid holds — and the grid excludes
          // «نوع اقامتگاه» and «منطقه اقامتگاه», so one click deleted both.
          scopeIds: managed.map((a) => a.id),
        }),
      });
      setSavedAt(Date.now());
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[90px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-x-16 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-y-16">
        <Card className="p-20">
          <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mb-14">
            <h3 className="text-16 leading-24 font-m text-black">
              امکانات
              <span className="text-13 font-r text-gray-6C6A7D">
                {" "}
                — {faNum(onCount)} از {faNum(managed.length)} فعال
              </span>
            </h3>

            <div className="flex items-center gap-x-8 flex-wrap gap-y-8">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی امکانات..."
                className="w-[190px] px-12 py-8 rounded-10 border border-gray-E5E5E6 text-13 leading-20 outline-none focus:border-primary-main"
              />
              {(["all", "on", "off"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`px-12 py-8 rounded-10 text-12 leading-20 border transition ${
                    filter === f
                      ? "border-primary-main bg-primary-light text-primary-dark font-m"
                      : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                  }`}
                >
                  {f === "all" ? "همه" : f === "on" ? "دارد" : "ندارد"}
                </button>
              ))}
            </div>
          </div>

          {shown === 0 ? (
            <p className="py-32 text-center text-13 text-gray-9B9BAA">
              امکاناتی با این جستجو پیدا نشد.
            </p>
          ) : (
            grouped.map(([category, items]) => {
              const catOn = items.filter((a) => selection[a.id]?.checked).length;
              const allOn = catOn === items.length;
              return (
                <section key={category} className="mb-20 last:mb-0">
                  <div className="flex items-center gap-x-10 mb-10">
                    <h4 className="text-14 leading-22 font-m text-black">{category}</h4>
                    <span className="text-11 leading-18 text-gray-9B9BAA">
                      {faNum(catOn)} از {faNum(items.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelection((s) => {
                          const next = { ...s };
                          items.forEach((a) => {
                            next[a.id] = {
                              checked: !allOn,
                              extra: s[a.id]?.extra ?? {},
                              value: s[a.id]?.value,
                            };
                          });
                          return next;
                        });
                        setSavedAt(null);
                      }}
                      className="mr-auto text-11 leading-18 text-gray-9B9BAA hover:text-primary-dark transition"
                    >
                      {allOn ? "برداشتن همه" : "انتخاب همه"}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {items.map((a) => (
                      <AmenityRow
                        key={a.id}
                        amenity={a}
                        entry={selection[a.id]}
                        onToggle={() => toggle(a.id)}
                        onEditFeatures={() => setFeatureFor(a)}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}

          <div className="mt-16 pt-16 border-t border-gray-F0F0F0">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
              سایر امکانات (متن آزاد)
            </span>
            <textarea
              value={other}
              onChange={(e) => {
                setOther(e.target.value);
                setSavedAt(null);
              }}
              rows={2}
              placeholder="امکاناتی که در لیست بالا نیست..."
              className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            />
          </div>
        </Card>
      </div>

      <Card className="p-14 w-[230px] shrink-0 flex flex-col gap-y-10 sticky top-[76px]">
        {/* Named, not counted: "۳ مورد تغییر می‌کند" is not something anyone can
            check, and this screen saves by replacing. */}
        {dirty ? (
          <div className="text-11 leading-18">
            {added.length > 0 && (
              <p className="text-[#2E7D32] mb-4">افزوده: {added.map((a) => a.name).join("، ")}</p>
            )}
            {removed.length > 0 && (
              <p className="text-[#C62828] mb-4">حذف: {removed.map((a) => a.name).join("، ")}</p>
            )}
            {otherChanged && <p className="text-gray-6C6A7D mb-4">متن «سایر امکانات» تغییر کرده.</p>}
          </div>
        ) : (
          <p className="text-11 leading-18 text-gray-9B9BAA">تغییری ثبت نشده.</p>
        )}

        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button
          variant="secondary"
          disabled={!dirty}
          onClick={() => {
            setSelection(initial);
            setOther(otherAmenities ?? "");
            setError(null);
          }}
        >
          بازگردانی
        </Button>

        {!!error && <p className="text-12 text-[#C62828]">{error}</p>}
        {!!savedAt && !error && <p className="text-12 text-[#015046]">ذخیره شد ✓</p>}
      </Card>

      {!!featureFor && (
        <FeatureModal
          amenity={featureFor}
          value={selection[featureFor.id]?.extra ?? {}}
          onClose={() => setFeatureFor(null)}
          onSave={(extra) =>
            setSelection((s) => ({
              ...s,
              // `value` carried through — dropping it here re-introduced the
              // «دارد» overwrite one amenity at a time.
              [featureFor.id]: { checked: true, extra, value: s[featureFor.id]?.value },
            }))
          }
        />
      )}
    </div>
  );
}

/**
 * One amenity. The whole row toggles rather than a 16px checkbox, and whatever
 * has been answered about it is printed underneath instead of hidden behind
 * the «ویژگی ها» link — «استخر» and «استخر سرپوشیده ۴×۸» are different facts,
 * and the tab used to show only the first.
 */
function AmenityRow({
  amenity,
  entry,
  onToggle,
  onEditFeatures,
}: {
  amenity: CatalogAmenity;
  entry: Entry | undefined;
  onToggle: () => void;
  onEditFeatures: () => void;
}) {
  const on = !!entry?.checked;
  const answers = Object.entries(entry?.extra ?? {}).filter(([, v]) => v);
  const hasFeatures = amenity.features.length > 0;

  return (
    <div
      className={`rounded-12 border p-10 transition ${
        on ? "border-primary-main bg-primary-light" : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        className="w-full flex items-center gap-x-8 text-right"
      >
        <span
          className={`w-18 h-18 rounded-6 border shrink-0 flex items-center justify-center text-11 leading-none ${
            on ? "bg-primary-main border-primary-main text-white" : "border-gray-C4CAD3"
          }`}
        >
          {on ? "✓" : ""}
        </span>
        {amenity.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={amenity.iconUrl} alt="" className="w-18 h-18 shrink-0 opacity-70" />
        ) : (
          <i className="icon-Possibilities text-16 text-gray-9B9BAA shrink-0" />
        )}
        <span
          className={`flex-1 min-w-0 truncate text-13 leading-20 ${
            on ? "text-primary-dark font-m" : "text-black"
          }`}
        >
          {amenity.name}
        </span>
      </button>

      {on && hasFeatures && (
        <div className="mt-8 pr-26">
          {answers.length > 0 ? (
            <p className="text-11 leading-18 text-gray-6C6A7D break-words">
              {answers.map(([k, v]) => `${k}: ${v}`).join(" · ")}
            </p>
          ) : (
            <p className="text-11 leading-18 text-gray-9B9BAA">
              {faNum(amenity.features.length)} جزئیات ثبت‌نشده
            </p>
          )}
          <button
            type="button"
            onClick={onEditFeatures}
            className="mt-4 text-11 leading-18 text-primary-dark hover:underline"
          >
            {answers.length > 0 ? "ویرایش جزئیات" : "ثبت جزئیات"}
          </button>
        </div>
      )}
    </div>
  );
}

function FeatureModal({
  amenity,
  value,
  onClose,
  onSave,
}: {
  amenity: CatalogAmenity;
  value: Record<string, string>;
  onClose: () => void;
  onSave: (next: Record<string, string>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(value);

  const set = (name: string, v: string) => setDraft((d) => ({ ...d, [name]: v }));

  return (
    <Modal open onClose={onClose} title={`ویژگی های ${amenity.name}`} width="max-w-[460px]">
      <div className="flex flex-col gap-y-14">
        {amenity.features.map((f) => {
          const options = (f.values ?? "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);

          if (f.fieldType === "SWITCH" || f.fieldType === "CHECKBOX") {
            // switches store one of their two option labels (e.g. "دارد"/"ندارد")
            const [on, off] = options.length >= 2 ? options : ["دارد", "ندارد"];
            const isOn = draft[f.name] === on;
            return (
              <label key={f.id} className="flex items-center justify-between gap-x-12">
                <span className="text-14 leading-22 text-black">{f.name}</span>
                <span className="flex items-center gap-x-8">
                  <span className="text-12 text-gray-6C6A7D">{isOn ? on : off}</span>
                  <Toggle checked={isOn} onChange={(next) => set(f.name, next ? on : off)} />
                </span>
              </label>
            );
          }

          if (f.fieldType === "DROPDOWN") {
            return (
              <label key={f.id} className="block">
                <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">{f.name}</span>
                <select
                  value={draft[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 bg-white outline-none focus:border-primary-main transition"
                >
                  <option value="">{f.placeholder || "انتخاب کنید"}</option>
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={f.id} className="block">
              <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">{f.name}</span>
              <input
                value={draft[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder ?? ""}
                className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
              />
            </label>
          );
        })}

        <div className="flex items-center gap-x-10 justify-between pt-4 flex-wrap gap-y-8">
          {/* Said here because the sidebar's ذخیره is the only thing that
              writes — closing this dialog changes nothing on the server. */}
          <span className="text-11 leading-18 text-gray-9B9BAA">
            برای ثبت نهایی، «ذخیره» کنار صفحه را بزنید.
          </span>
          <span className="flex items-center gap-x-8 shrink-0">
            <Button variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button
              onClick={() => {
                // drop empties so we don't persist blank answers
                onSave(Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== "")));
                onClose();
              }}
            >
              تایید
            </Button>
          </span>
        </div>
      </div>
    </Modal>
  );
}
