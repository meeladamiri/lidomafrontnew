import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, faNum } from "@/components/Admin/ui";

// "ظرفیت" tab: base/max guest counts plus the room list. Rooms carry the bed
// breakdown; the shared-space row is a room named "فضای مشترک" (it can't be
// removed — every residence has one).
const SHARED_NAME = "فضای مشترک";

export interface RoomRow {
  id?: number;
  name: string;
  singleBed: number;
  doubleBed: number;
  traditionalBed: number;
  description?: string | null;
}

function Stepper({
  value,
  onChange,
  min = 0,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-x-10">
      <span className="text-13 leading-20 text-gray-6C6A7D whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-x-8">
        <button
          type="button"
          aria-label={`کاهش ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-24 h-24 rounded-full border border-gray-E5E5E6 text-gray-6C6A7D hover:bg-gray-F0F0F0 transition leading-none"
        >
          −
        </button>
        <span className="min-w-[28px] text-center text-14 font-m text-black">{faNum(value)}</span>
        <button
          type="button"
          aria-label={`افزایش ${label}`}
          onClick={() => onChange(value + 1)}
          className="w-24 h-24 rounded-full border border-gray-E5E5E6 text-gray-6C6A7D hover:bg-gray-F0F0F0 transition leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

function RoomEditor({
  room,
  title,
  onChange,
  onRemove,
}: {
  room: RoomRow;
  title: string;
  onChange: (next: RoomRow) => void;
  onRemove?: () => void;
}) {
  const set = (k: keyof RoomRow) => (v: number) => onChange({ ...room, [k]: v });

  return (
    <div className="py-16 border-b border-gray-F0F0F0 last:border-0">
      <div className="flex items-center justify-between mb-12">
        <h4 className="text-14 leading-22 font-m text-black">{title}</h4>
        {!!onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`حذف ${title}`}
            className="w-28 h-28 rounded-8 text-[#E53935] hover:bg-[#FFEBEB] transition"
          >
            <i className="icon-Delete text-16" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-x-32 gap-y-12 flex-wrap">
        <Stepper label="تعداد تخت یک نفره" value={room.singleBed} onChange={set("singleBed")} />
        <Stepper label="تعداد تخت دو نفره" value={room.doubleBed} onChange={set("doubleBed")} />
        <Stepper
          label="تعداد رخت خواب"
          value={room.traditionalBed}
          onChange={set("traditionalBed")}
        />
      </div>

      <input
        value={room.description ?? ""}
        onChange={(e) => onChange({ ...room, description: e.target.value })}
        placeholder="سایر موارد ( مثل مبل تاشو )"
        className="w-full mt-12 px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
      />
    </div>
  );
}

export default function CapacityTab({
  residenceId,
  capacity,
  maxCapacity,
  rooms,
  onSaved,
}: {
  residenceId: number;
  capacity: number | null;
  maxCapacity: number | null;
  rooms: RoomRow[];
  onSaved: () => void;
}) {
  const initialShared =
    rooms.find((r) => r.name === SHARED_NAME) ??
    ({ name: SHARED_NAME, singleBed: 0, doubleBed: 0, traditionalBed: 0, description: "" } as RoomRow);
  const initialRooms = rooms.filter((r) => r.name !== SHARED_NAME);

  const [base, setBase] = useState(capacity ?? 0);
  const [max, setMax] = useState(maxCapacity ?? 0);
  const [shared, setShared] = useState<RoomRow>(initialShared);
  const [list, setList] = useState<RoomRow[]>(initialRooms);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function addRoom() {
    setList((l) => [
      ...l,
      { name: `اتاق ${l.length + 1}`, singleBed: 0, doubleBed: 0, traditionalBed: 0, description: "" },
    ]);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/capacity`, {
        method: "PATCH",
        body: JSON.stringify({ capacity: base, maxCapacity: max }),
      });
      // rooms are replaced wholesale so removals stick
      await apiFetch(`/api/admin/residences/${residenceId}/rooms`, {
        method: "PUT",
        body: JSON.stringify({
          rooms: [shared, ...list].map((r) => ({
            name: r.name,
            singleBed: Number(r.singleBed) || 0,
            doubleBed: Number(r.doubleBed) || 0,
            traditionalBed: Number(r.traditionalBed) || 0,
            description: r.description || undefined,
          })),
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

  return (
    <div className="flex gap-x-16 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-y-16">
        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-16">ظرفیت</h3>
          <div className="flex items-center gap-x-40 gap-y-12 flex-wrap">
            <Stepper label="ظرفیت پایه" value={base} onChange={setBase} min={1} />
            <Stepper label="حداکثر ظرفیت" value={max} onChange={setMax} min={1} />
          </div>
          {max > 0 && base > max && (
            <p className="mt-10 text-12 text-[#B26A00]">
              ظرفیت پایه از حداکثر ظرفیت بیشتر است.
            </p>
          )}
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-16 leading-24 font-m text-black">لیست اتاق ها</h3>
            <Button variant="secondary" onClick={addRoom}>
              <i className="icon-Plus text-16" /> افزودن اتاق
            </Button>
          </div>

          <RoomEditor room={shared} title={SHARED_NAME} onChange={setShared} />

          {list.map((room, i) => (
            <RoomEditor
              key={room.id ?? `new-${i}`}
              room={room}
              title={room.name || `اتاق ${i + 1}`}
              onChange={(next) => setList((l) => l.map((r, ri) => (ri === i ? next : r)))}
              onRemove={() => setList((l) => l.filter((_, ri) => ri !== i))}
            />
          ))}

          {list.length === 0 && (
            <p className="py-16 text-13 text-gray-9B9BAA">اتاقی ثبت نشده — با «افزودن اتاق» شروع کن.</p>
          )}
        </Card>
      </div>

      <Card className="p-12 w-[200px] shrink-0 flex flex-col gap-y-8 sticky top-[76px]">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setBase(capacity ?? 0);
            setMax(maxCapacity ?? 0);
            setShared(initialShared);
            setList(initialRooms);
            setError(null);
          }}
        >
          انصراف
        </Button>
        {!!error && <p className="text-12 text-[#C62828] mt-4">{error}</p>}
        {!!savedAt && !error && <p className="text-12 text-[#015046] mt-4">ذخیره شد ✓</p>}
      </Card>
    </div>
  );
}
