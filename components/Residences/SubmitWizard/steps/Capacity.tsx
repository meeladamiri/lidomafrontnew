import React, { useEffect, useMemo } from "react";
import { saveCapacity, saveRooms, type DraftRoom } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import { Callout, CounterRow, Section, StepSkeleton, TextInput, faDigits } from "../ui";

/**
 * Step four: how many people, and in what rooms.
 *
 * Rooms are sent whole rather than diffed — the step submits the entire list,
 * so replace-all is both simpler and impossible to get half-right.
 *
 * The two capacities are a pair, not two independent numbers, and the form
 * says so: the maximum follows the base until a host deliberately raises it,
 * and it can never sit below it.
 */

interface RoomValue {
  key: string;
  name: string;
  singleBed: number;
  doubleBed: number;
  traditionalBed: number;
  description: string;
}

interface Values {
  capacity: number;
  maxCapacity: number;
  /**
   * The beds that are not in a room — the living room, the hall, the terrace.
   *
   * A first-class section rather than one of the room cards, because most
   * listings sleep people there and none of them would think to "add a room"
   * called it. Stored as a room named exactly «فضای مشترک», which is how the
   * previous wizard and the panel both recognise it.
   */
  shared: Omit<RoomValue, "key" | "name">;
  rooms: RoomValue[];
}

/** The name that marks a room row as the shared space, on both sides. */
const SHARED_SPACE = "فضای مشترک";

let roomKeySeed = 0;
const newRoom = (index: number): RoomValue => ({
  key: `room-${++roomKeySeed}`,
  name: `اتاق ${faDigits(index + 1)}`,
  singleBed: 0,
  doubleBed: 0,
  traditionalBed: 0,
  description: "",
});

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.capacity) errors.capacity = "ظرفیت استاندارد را مشخص کنید.";
  if (values.maxCapacity && values.maxCapacity < values.capacity) {
    errors.maxCapacity = "حداکثر ظرفیت نمی‌تواند از ظرفیت استاندارد کمتر باشد.";
  }
  if (values.rooms.some((room) => !room.name.trim())) {
    errors.rooms = "هر اتاق باید نامی داشته باشد.";
  }
  return errors;
}

export default function CapacityStep() {
  const { draft, residenceId, commit, saveState, next, setDirty, progressMarker } = useWizard();

  const initial = useMemo<Values | undefined>(() => {
    if (!draft) return undefined;
    const all = draft.rooms ?? [];
    const sharedRow = all.find((room) => room.name === SHARED_SPACE);
    const others = all.filter((room) => room.name !== SHARED_SPACE);

    return {
      capacity: draft.capacity ?? 2,
      maxCapacity: draft.maxCapacity ?? draft.capacity ?? 2,
      shared: {
        singleBed: sharedRow?.singleBed ?? 0,
        doubleBed: sharedRow?.doubleBed ?? 0,
        traditionalBed: sharedRow?.traditionalBed ?? 0,
        description: sharedRow?.description ?? "",
      },
      rooms: others.map((room, index) => ({
        key: `room-${++roomKeySeed}-${index}`,
        name: room.name || `اتاق ${faDigits(index + 1)}`,
        singleBed: room.singleBed ?? 0,
        doubleBed: room.doubleBed ?? 0,
        traditionalBed: room.traditionalBed ?? 0,
        description: room.description ?? "",
      })),
    };
  }, [draft]);

  const form = useStepForm<Values>({
    initial,
    validate,
    rescueKey: residenceId ? `lidoma:wizard:${residenceId}:capacity` : undefined,
  });

  useEffect(() => {
    setDirty(form.dirty);
  }, [form.dirty, setDirty]);

  const setCapacity = (value: number) =>
    form.setValues((previous) => ({
      ...previous,
      capacity: value,
      // The maximum trails the base rather than silently becoming invalid.
      maxCapacity: Math.max(previous.maxCapacity, value),
    }));

  const patchRoom = (key: string, patch: Partial<RoomValue>) =>
    form.setValues((previous) => ({
      ...previous,
      rooms: previous.rooms.map((room) => (room.key === key ? { ...room, ...patch } : room)),
    }));

  const setShared = (patch: Partial<Values["shared"]>) =>
    form.setValues((previous) => ({ ...previous, shared: { ...previous.shared, ...patch } }));

  const bedsIn = (r: { singleBed: number; doubleBed: number; traditionalBed: number }) =>
    r.singleBed + r.doubleBed * 2 + r.traditionalBed;

  const sharedHasContent =
    bedsIn(form.values.shared) > 0 || form.values.shared.description.trim() !== "";

  const beds =
    form.values.rooms.reduce((total, room) => total + bedsIn(room), 0) + bedsIn(form.values.shared);

  async function onNext() {
    const problems = form.submit();
    if (problems.length) return problems;

    // The shared space is sent as a room only when it holds something. An
    // empty «فضای مشترک» row on every listing would be a row that means
    // "the host saw this section", which is not information.
    const rooms: DraftRoom[] = [
      ...(sharedHasContent
        ? [
            {
              name: SHARED_SPACE,
              singleBed: form.values.shared.singleBed,
              doubleBed: form.values.shared.doubleBed,
              traditionalBed: form.values.shared.traditionalBed,
              description: form.values.shared.description.trim() || undefined,
            },
          ]
        : []),
      ...form.values.rooms.map((room) => ({
        name: room.name.trim(),
        singleBed: room.singleBed,
        doubleBed: room.doubleBed,
        traditionalBed: room.traditionalBed,
        description: room.description.trim() || undefined,
      })),
    ];

    commit(
      async (id) => {
        const result = await saveRooms(id, {
          capacity: form.values.capacity,
          maxCapacity: form.values.maxCapacity,
          rooms,
        });
        if (!result.ok) {
          if (result.fieldErrors) form.setServerErrors(result.fieldErrors);
          return result;
        }
        form.markSaved();
        // The progress marker lives on the residence row, which the rooms
        // endpoint does not touch — so it rides on a second write inside the
        // same save, rather than a second save that would be refused as a
        // double submit.
        return saveCapacity(id, { step: progressMarker });
      },
      // Rooms come back with server-assigned ids; the cached draft needs them.
      { reload: true }
    );
    setDirty(false);
    next();
  }

  if (!form.ready) return <StepSkeleton />;

  return (
    <StepLayout onNext={onNext} busy={saveState === "saving"}>
      <Section title="ظرفیت">
        <div className="rounded-16 border border-gray-DBDFE5 px-16">
          <CounterRow
            label="ظرفیت استاندارد"
            description="تعداد نفراتی که راحت اقامت می‌کنند."
            value={form.values.capacity}
            onChange={setCapacity}
            min={1}
            max={50}
          />
          <CounterRow
            label="حداکثر ظرفیت"
            description="با تخت اضافه یا تشک. برای نفرات بیشتر نرخ نفر اضافه اعمال می‌شود."
            value={form.values.maxCapacity}
            onChange={(value) => form.setField("maxCapacity", value)}
            min={form.values.capacity}
            max={60}
          />
        </div>
        {form.visibleErrors.capacity && (
          <p role="alert" className="text-12 text-error-light font-m mt-8">
            {form.visibleErrors.capacity}
          </p>
        )}
        {form.visibleErrors.maxCapacity && (
          <p role="alert" className="text-12 text-error-light font-m mt-8">
            {form.visibleErrors.maxCapacity}
          </p>
        )}
      </Section>

      <Section title="فضای مشترک" description="جای خوابی که در اتاق نیست — پذیرایی، هال، تراس.">
        <div className="rounded-16 border border-gray-DBDFE5 px-16">
          <CounterRow
            label="تخت یک‌نفره"
            value={form.values.shared.singleBed}
            onChange={(value) => setShared({ singleBed: value })}
            max={20}
          />
          <CounterRow
            label="تخت دونفره"
            value={form.values.shared.doubleBed}
            onChange={(value) => setShared({ doubleBed: value })}
            max={20}
          />
          <CounterRow
            label="رخت‌خواب سنتی"
            value={form.values.shared.traditionalBed}
            onChange={(value) => setShared({ traditionalBed: value })}
            max={20}
          />
          <div className="py-14">
            <TextInput
              value={form.values.shared.description}
              onChange={(e) => setShared({ description: e.target.value })}
              placeholder="توضیح کوتاه (اختیاری)"
              aria-label="توضیح فضای مشترک"
            />
          </div>
        </div>
      </Section>

      <Section
        title="اتاق‌ها"
        description="اختیاری، ولی مهمان‌ها پیش از رزرو دقیقاً همین را می‌پرسند."
      >
        {form.values.rooms.length === 0 ? (
          <div className="rounded-16 border border-dashed border-gray-DBDFE5 py-28 text-center">
            <i className="icon-Rooms text-32 text-gray-A9B1BC" />
            <p className="text-13 font-l text-gray-77828F mt-8 mb-16">
              هنوز اتاقی اضافه نکرده‌اید.
            </p>
            <button
              type="button"
              onClick={() => form.setValues((p) => ({ ...p, rooms: [newRoom(0)] }))}
              className="h-[40px] px-20 rounded-10 border border-primary-main text-13 font-m text-primary-dark"
            >
              افزودن اتاق
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-y-12">
              {form.values.rooms.map((room, index) => (
                <div key={room.key} className="rounded-16 border border-gray-DBDFE5 p-16">
                  <div className="flex items-center gap-x-12 mb-4">
                    <span className="w-28 h-28 shrink-0 rounded-full bg-gray-F3F5F7 grid place-items-center text-12 font-b text-black">
                      {faDigits(index + 1)}
                    </span>
                    <input
                      value={room.name}
                      onChange={(e) => patchRoom(room.key, { name: e.target.value })}
                      aria-label={`نام اتاق ${faDigits(index + 1)}`}
                      className="grow h-[40px] px-12 rounded-10 border border-gray-DBDFE5 text-14 font-m text-black outline-none focus:border-primary-main"
                      placeholder="نام اتاق"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        form.setValues((p) => ({
                          ...p,
                          rooms: p.rooms.filter((r) => r.key !== room.key),
                        }))
                      }
                      aria-label={`حذف اتاق ${faDigits(index + 1)}`}
                      className="w-36 h-36 shrink-0 rounded-full grid place-items-center text-gray-77828F hover:text-error-light transition-colors"
                    >
                      <i className="icon-Delete text-18" />
                    </button>
                  </div>

                  <CounterRow
                    label="تخت یک‌نفره"
                    value={room.singleBed}
                    onChange={(value) => patchRoom(room.key, { singleBed: value })}
                    max={20}
                  />
                  <CounterRow
                    label="تخت دونفره"
                    value={room.doubleBed}
                    onChange={(value) => patchRoom(room.key, { doubleBed: value })}
                    max={20}
                  />
                  <CounterRow
                    label="رخت‌خواب سنتی"
                    value={room.traditionalBed}
                    onChange={(value) => patchRoom(room.key, { traditionalBed: value })}
                    max={20}
                  />

                  <div className="mt-12">
                    <TextInput
                      value={room.description}
                      onChange={(e) => patchRoom(room.key, { description: e.target.value })}
                      placeholder="توضیح کوتاه (اختیاری)"
                      aria-label={`توضیح اتاق ${faDigits(index + 1)}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                form.setValues((p) => ({ ...p, rooms: [...p.rooms, newRoom(p.rooms.length)] }))
              }
              className="w-full h-[48px] mt-12 rounded-12 border border-dashed border-gray-DBDFE5 text-13 font-m text-gray-77828F hover:border-primary-main hover:text-primary-dark transition-colors"
            >
              + افزودن اتاق دیگر
            </button>
          </>
        )}

        {form.visibleErrors.rooms && (
          <p role="alert" className="text-12 text-error-light font-m mt-8">
            {form.visibleErrors.rooms}
          </p>
        )}

        {beds > 0 && beds < form.values.capacity && (
          <div className="mt-12">
            <Callout tone="warning">
              مجموع خواب‌های اتاق‌ها {faDigits(beds)} نفر است، ولی ظرفیت را{" "}
              {faDigits(form.values.capacity)} نفر گفته‌اید. اگر جای خواب دیگری هست (پذیرایی، تشک
              اضافه) در توضیحات بنویسید.
            </Callout>
          </div>
        )}
      </Section>
    </StepLayout>
  );
}
