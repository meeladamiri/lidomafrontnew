import React, { memo } from "react";
import { faDigits, money, WEEKDAY_LABELS, type Day, type JalaliMonth } from "./model";

/**
 * One Jalali month.
 *
 * The cell is memoised on its own values, so dragging a selection across a
 * month re-renders the cells whose selected-ness actually changed rather than
 * all forty-two. That is the difference between a drag that tracks the finger
 * and one that stutters.
 */

interface CellProps {
  day: Day;
  selected: boolean;
  onPointerDown: (iso: string) => void;
  onPointerEnter: (iso: string) => void;
}

const DayCell = memo(function DayCell({
  day,
  selected,
  onPointerDown,
  onPointerEnter,
}: CellProps) {
  const disabled = day.state === "past" || day.state === "booked";

  const tone = selected
    ? "bg-primary-main border-primary-main text-black"
    : day.state === "past"
      ? "bg-white border-gray-F3F5F7 text-gray-C4CAD3"
      : day.state === "booked"
        ? "bg-blue-light border-blue-light text-black"
        : day.state === "blocked"
          ? "bg-gray-F3F5F7 border-gray-E9ECF0 text-gray-A9B1BC"
          : "bg-white border-gray-E9ECF0 text-black hover:border-primary-main";

  const label =
    day.state === "booked"
      ? `${faDigits(day.label)} — رزرو شده${day.booking?.guestName ? ` توسط ${day.booking.guestName}` : ""}`
      : day.state === "blocked"
        ? `${faDigits(day.label)} — بسته`
        : `${faDigits(day.label)} — ${money(day.price)} تومان`;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      // Pointer events rather than mouse: one code path covers touch drag,
      // which is how most hosts will use this.
      onPointerDown={() => !disabled && onPointerDown(day.iso)}
      onPointerEnter={() => !disabled && onPointerEnter(day.iso)}
      className={`relative h-[52px] rounded-8 border flex flex-col items-center justify-center gap-y-1 transition-colors select-none touch-none disabled:cursor-not-allowed ${tone}`}
    >
      <span className={`text-13 leading-16 ${selected ? "font-b" : "font-m"}`}>
        {faDigits(day.label)}
      </span>

      {day.state === "booked" ? (
        <i className="icon-Reserve text-11 text-blue-main" />
      ) : day.state === "blocked" ? (
        <i className="icon-Block text-11" />
      ) : (
        <span
          className={`text-9 leading-12 ${
            day.hasSpecialPrice && !selected ? "text-primary-dark font-m" : "font-l opacity-70"
          }`}
        >
          {money(day.price)}
        </span>
      )}

      {/* Two dots, bottom corners: a discount and an instant-book exception. */}
      {day.discount ? (
        <span className="absolute bottom-3 right-4 w-5 h-5 rounded-full bg-error-light" />
      ) : null}
      {day.hasFastOverride ? (
        <span
          className={`absolute bottom-3 left-4 w-5 h-5 rounded-full ${
            day.isFast ? "bg-warning" : "bg-gray-A9B1BC"
          }`}
        />
      ) : null}
    </button>
  );
});

export default function MonthGrid({
  month,
  selected,
  onPointerDown,
  onPointerEnter,
}: {
  month: JalaliMonth;
  selected: Set<string>;
  onPointerDown: (iso: string) => void;
  onPointerEnter: (iso: string) => void;
}) {
  return (
    <section className="w-full">
      <h3 className="text-14 leading-24 font-b text-black text-center mb-10">{month.title}</h3>

      <div className="grid grid-cols-7 gap-x-4 mb-4" aria-hidden="true">
        {WEEKDAY_LABELS.map((label, i) => (
          <span
            key={label}
            className={`text-11 leading-20 font-m text-center ${
              i >= 5 ? "text-error-light" : "text-gray-77828F"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {month.cells.map((day, index) =>
          day ? (
            <DayCell
              key={day.iso}
              day={day}
              selected={selected.has(day.iso)}
              onPointerDown={onPointerDown}
              onPointerEnter={onPointerEnter}
            />
          ) : (
            <span key={`empty-${index}`} className="h-[52px]" />
          )
        )}
      </div>
    </section>
  );
}
