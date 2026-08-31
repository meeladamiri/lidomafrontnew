import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Skeleton, faId, faNum, parseNum } from "@/components/Admin/ui";

/**
 * «اهمیت» و رتبه در نتایج جستجوی شهر.
 *
 * «اهمیت» was a bare number in an edit form — 14,056,810 tells the person
 * typing it nothing, and the only way to find out what raising it did was to
 * open the public search and count down the page.
 *
 * So the number is shown next to the thing it controls: this listing's
 * position among the others in its city, with its immediate neighbours either
 * side. Typing a new value re-asks the server where that would land, before
 * anything is saved.
 *
 * The ordering the rank is computed from is the search's own default —
 * importance, then rating, then newest. A rank worked out any other way would
 * describe a page that does not exist.
 */

interface Neighbour {
  id: number;
  name: string;
  importance: number;
  averageRating: number;
  rank: number;
  isSelf: boolean;
}

interface Rank {
  city: { id: number; name: string } | null;
  total: number;
  current_rank: number | null;
  simulated_rank: number | null;
  importance: number;
  published: boolean;
  neighbours: Neighbour[];
}

export default function RankCard({
  residenceId,
  onSaved,
}: {
  residenceId: number;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<Rank>(
    `/api/admin/residences/${residenceId}/rank`,
    (p: string) => apiFetch<Rank>(p)
  );

  // Only when the saved value moves — not on every refetch, which would wipe
  // whatever is half-typed in the field.
  const savedImportance = data?.importance;
  useEffect(() => {
    if (savedImportance !== undefined) setDraft(String(savedImportance));
  }, [savedImportance]);

  const value = parseNum(draft);
  const changed = !!data && value !== data.importance;

  // Only asked for once the number actually differs — otherwise every
  // keystroke on an unchanged field would be a request.
  const { data: preview } = useSWR<Rank>(
    changed ? `/api/admin/residences/${residenceId}/rank?importance=${value}` : null,
    (p: string) => apiFetch<Rank>(p)
  );

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}`, {
        method: "PATCH",
        body: JSON.stringify({ importance: value }),
      });
      mutate();
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !data) return <Skeleton className="h-[220px]" />;


  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <h3 className="text-16 leading-24 font-m text-black">اهمیت و رتبه در جستجو</h3>
        {data.city && <Badge tone="gray">{data.city.name}</Badge>}
      </div>

      {!data.city ? (
        <p className="text-13 leading-22 text-gray-6C6A7D">
          این اقامتگاه به شهری وصل نیست، پس رتبه‌ای در نتایج شهر ندارد.
        </p>
      ) : !data.published ? (
        <p className="text-13 leading-22 text-[#B26A00]">
          این اقامتگاه منتشر نشده و در نتایج جستجو دیده نمی‌شود. «اهمیت» ذخیره می‌شود ولی تا زمان
          انتشار اثری ندارد.
        </p>
      ) : (
        <div className="flex items-center gap-x-16 flex-wrap gap-y-10 mb-14">
          <div className="rounded-12 border border-gray-E5E5E6 px-16 py-10">
            <span className="block text-11 leading-18 text-gray-9B9BAA mb-2">رتبه فعلی</span>
            <strong className="text-20 leading-28 font-m text-black">
              {faNum(data.current_rank ?? 0)}
            </strong>
            <span className="text-12 text-gray-6C6A7D"> از {faNum(data.total)}</span>
          </div>

          {preview?.simulated_rank != null && preview.simulated_rank !== data.current_rank && (
            <div className="rounded-12 border border-[#B26A00] bg-[#FFF4E0] px-16 py-10">
              <span className="block text-11 leading-18 text-[#B26A00] mb-2">با مقدار جدید</span>
              <strong className="text-20 leading-28 font-m text-[#B26A00]">
                {faNum(preview.simulated_rank)}
              </strong>
              <span className="text-12 text-[#B26A00]"> از {faNum(preview.total)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-x-8 mb-4">
        <label className="flex-1 min-w-0">
          <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
            اهمیت اقامتگاه
          </span>
          <input
            inputMode="numeric"
            value={value ? faId(value) : ""}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
          />
        </label>
        <Button disabled={busy || !changed} onClick={save}>
          {busy ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        {changed && (
          <Button variant="secondary" onClick={() => setDraft(String(data.importance))}>
            بازگردانی
          </Button>
        )}
      </div>

      {/* Not a percentage or a score — it is a sort key, and the only thing
          that matters is whether it is bigger than the neighbours'. */}
      <p className="text-11 leading-18 text-gray-9B9BAA mb-14">
        عدد بزرگ‌تر یعنی بالاتر در «پیشنهاد لیدوما». در تساوی، امتیاز و بعد تازگی تعیین‌کننده است.
      </p>

      {data.neighbours.length > 0 && (
        <div className="rounded-12 border border-gray-E5E5E6 divide-y divide-gray-F0F0F0">
          {data.neighbours.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-x-10 px-12 py-8 ${
                n.isSelf ? "bg-primary-light" : ""
              }`}
            >
              <span
                className={`w-28 text-center text-12 leading-20 ${
                  n.isSelf ? "text-primary-dark font-m" : "text-gray-9B9BAA"
                }`}
              >
                {faNum(n.rank)}
              </span>
              <span
                className={`flex-1 min-w-0 truncate text-13 leading-20 ${
                  n.isSelf ? "text-primary-dark font-m" : "text-black"
                }`}
              >
                {n.name}
              </span>
              <span className="text-11 leading-18 text-gray-9B9BAA whitespace-nowrap">
                {faId(n.importance)}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
    </Card>
  );
}
