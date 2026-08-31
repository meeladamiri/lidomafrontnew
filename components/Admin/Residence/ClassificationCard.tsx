import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Card, Skeleton } from "@/components/Admin/ui";

/**
 * «نوع اقامتگاه» و «منطقه اقامتگاه».
 *
 * The panel used to offer two free-text boxes named «منطقه اقامتگاه» and
 * «نوع اجاره» that wrote to residence columns nothing reads — three listings
 * between them. The real taxonomies live in the amenities system, on 8,689
 * and 8,518 listings, and the SEO tag pages are built from them: «اجاره ویلا
 * و سوئیت ساحلی» exists because listings answer `area = ساحلی`.
 *
 * So this edits the real thing, and says out loud what depends on it —
 * changing a listing's type moves which tag pages it appears on.
 *
 * Multi-select because the data is: 34 listings are «شهری، ساحلی» and the tag
 * engine matches any one of the values.
 */

interface Field {
  key: string;
  name: string;
  options: string[];
  selected: string[];
}

export default function ClassificationCard({
  residenceId,
  onSaved,
}: {
  residenceId: number;
  onSaved: () => void;
}) {
  const { data, isLoading, mutate } = useSWR<{ fields: Field[] }>(
    `/api/admin/residences/${residenceId}/classification`,
    (p: string) => apiFetch<{ fields: Field[] }>(p)
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(field: Field, value: string) {
    const next = field.selected.includes(value)
      ? field.selected.filter((v) => v !== value)
      : [...field.selected, value];

    setBusy(field.key);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/classification`, {
        method: "PATCH",
        body: JSON.stringify({ key: field.key, values: next }),
      });
      mutate();
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading || !data) return <Skeleton className="h-[180px]" />;

  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-2">دسته‌بندی اقامتگاه</h3>
      <p className="text-11 leading-18 text-gray-9B9BAA mb-14">
        صفحه‌های تگ سئو از همین دو مورد ساخته می‌شوند — تغییرشان یعنی این اقامتگاه در فهرست‌های
        دیگری دیده می‌شود.
      </p>

      <div className="flex flex-col gap-y-16">
        {data.fields.map((field) => (
          <div key={field.key}>
            <div className="flex items-center gap-x-8 mb-8">
              <span className="text-13 leading-20 font-m text-black">{field.name}</span>
              {field.selected.length === 0 && <Badge tone="yellow">ثبت نشده</Badge>}
              {busy === field.key && (
                <span className="text-11 text-gray-9B9BAA">در حال ذخیره...</span>
              )}
            </div>

            {field.options.length === 0 ? (
              <p className="text-12 leading-20 text-gray-9B9BAA">
                مقداری برای این دسته‌بندی در سامانه ثبت نشده است.
              </p>
            ) : (
              <div className="flex flex-wrap gap-8">
                {field.options.map((option) => {
                  const on = field.selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={on}
                      disabled={busy === field.key}
                      onClick={() => toggle(field, option)}
                      className={`px-12 py-6 rounded-10 text-12 leading-20 border transition disabled:opacity-50 ${
                        on
                          ? "border-primary-main bg-primary-light text-primary-dark font-m"
                          : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
    </Card>
  );
}
