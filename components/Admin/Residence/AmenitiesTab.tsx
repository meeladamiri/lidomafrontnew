import { useMemo, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, Modal, Skeleton, Toggle } from "@/components/Admin/ui";

// "امکانات" tab. The catalog comes from the admin amenity settings; each
// amenity can define sub-features ("ویژگی ها") — dropdown/text/switch fields
// migrated from Odoo's x_extra_info — whose answers live per residence in
// ResidenceAmenity.extraFeatures.extra.

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

type Selection = Record<number, { checked: boolean; extra: Record<string, string> }>;

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
    <Modal open onClose={onClose} title={`ویژگی های ${amenity.name}`} width="max-w-[420px]">
      <div className="flex flex-col gap-y-14">
        {amenity.features.map((f) => {
          const options = (f.values ?? "").split(",").map((o) => o.trim()).filter(Boolean);

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

        <div className="flex items-center gap-x-10 justify-end pt-4">
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
            ذخیره
          </Button>
        </div>
      </div>
    </Modal>
  );
}

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
      sel[a.amenity.id] = { checked: true, extra: a.extraFeatures?.extra ?? {} };
    }
    return sel;
  }, [amenities]);

  const [selection, setSelection] = useState<Selection>(initial);
  const [other, setOther] = useState(otherAmenities ?? "");
  const [featureFor, setFeatureFor] = useState<CatalogAmenity | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Categorical attributes (type/area/rent-type) are set on the basic-info tab,
  // not here — this grid is the yes/no amenity list.
  const grouped = useMemo(() => {
    const byCategory = new Map<string, CatalogAmenity[]>();
    for (const a of catalog ?? []) {
      if (["type", "area", "rent-type"].includes(a.key ?? "")) continue;
      const cat = a.category || "سایر";
      byCategory.set(cat, [...(byCategory.get(cat) ?? []), a]);
    }
    return [...byCategory.entries()];
  }, [catalog]);

  function toggle(id: number) {
    setSelection((s) => ({
      ...s,
      [id]: { checked: !s[id]?.checked, extra: s[id]?.extra ?? {} },
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/amenities`, {
        method: "PATCH",
        body: JSON.stringify({
          amenities: Object.entries(selection)
            .filter(([, v]) => v.checked)
            .map(([id, v]) => ({
              amenityId: Number(id),
              // keep the legacy shape: {value, extra}
              extraFeatures: {
                value: "دارد",
                ...(Object.keys(v.extra).length ? { extra: v.extra } : {}),
              },
            })),
          other: other || undefined,
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
          <h3 className="text-16 leading-24 font-m text-black mb-16">امکانات</h3>

          {grouped.map(([category, items]) => (
            <section key={category} className="mb-20 last:mb-0">
              <h4 className="text-14 leading-22 font-m text-black mb-10">{category}</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-24 gap-y-10">
                {items.map((a) => {
                  const state = selection[a.id];
                  const hasFeatures = a.features.length > 0;
                  const answered = Object.keys(state?.extra ?? {}).length > 0;
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-x-8">
                      <label className="flex items-center gap-x-8 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!state?.checked}
                          onChange={() => toggle(a.id)}
                          className="w-16 h-16 rounded-4 accent-primary-main shrink-0"
                        />
                        {a.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.iconUrl} alt="" className="w-18 h-18 shrink-0 opacity-70" />
                        ) : (
                          <i className="icon-Possibilities text-16 text-gray-9B9BAA shrink-0" />
                        )}
                        <span className="text-13 leading-20 text-black truncate">{a.name}</span>
                      </label>

                      {hasFeatures && (
                        <button
                          type="button"
                          onClick={() => setFeatureFor(a)}
                          disabled={!state?.checked}
                          className={`text-12 font-m shrink-0 transition ${
                            state?.checked
                              ? answered
                                ? "text-primary-dark"
                                : "text-primary-main"
                              : "text-gray-ADADB2 cursor-not-allowed"
                          }`}
                        >
                          ویژگی ها{answered ? " ✓" : ""}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="mt-16">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
              سایر امکانات (متن آزاد)
            </span>
            <textarea
              value={other}
              onChange={(e) => setOther(e.target.value)}
              rows={2}
              placeholder="امکاناتی که در لیست بالا نیست..."
              className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            />
          </div>
        </Card>
      </div>

      <Card className="p-12 w-[200px] shrink-0 flex flex-col gap-y-8 sticky top-[76px]">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setSelection(initial);
            setOther(otherAmenities ?? "");
            setError(null);
          }}
        >
          انصراف
        </Button>
        {!!error && <p className="text-12 text-[#C62828] mt-4">{error}</p>}
        {!!savedAt && !error && <p className="text-12 text-[#015046] mt-4">ذخیره شد ✓</p>}
      </Card>

      {!!featureFor && (
        <FeatureModal
          amenity={featureFor}
          value={selection[featureFor.id]?.extra ?? {}}
          onClose={() => setFeatureFor(null)}
          onSave={(extra) =>
            setSelection((s) => ({
              ...s,
              [featureFor.id]: { checked: true, extra },
            }))
          }
        />
      )}
    </div>
  );
}
