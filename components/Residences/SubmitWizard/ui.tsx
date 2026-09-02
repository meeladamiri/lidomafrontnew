import React, { useId, useMemo } from "react";
import { toEnDigit } from "@/utilities/Number_tools";

/**
 * The wizard's controls.
 *
 * Deliberately not the app's shared `components/General/core` inputs: those
 * take a formik instance as a prop and read `formik.errors[name]` themselves,
 * which forces every screen that wants one field to carry a whole form object.
 * These are plain controlled inputs. They are also the reason the wizard can
 * show an error the moment a field is left rather than on submit.
 *
 * Everything here is keyboard-reachable and labelled. A host filling in
 * fifteen numbers on a phone, one-handed, is the person this is for.
 */

// ---------------------------------------------------------------- digits ---

/** ۱۲۳ and ١٢٣ are 123. Applied on the way in, so state holds plain digits. */
export function normalizeDigits(value: string): string {
  return toEnDigit(value);
}

/** Digits only — for areas, counts and prices. Keeps the field from ever holding junk. */
export function digitsOnly(value: string): string {
  return normalizeDigits(value).replace(/[^\d]/g, "");
}

/** Digits, one dot and a leading minus — for coordinates. */
export function decimalOnly(value: string): string {
  const cleaned = normalizeDigits(value).replace(/[^\d.-]/g, "");
  const negative = cleaned.startsWith("-");
  const [head, ...rest] = cleaned.replace(/-/g, "").split(".");
  return (negative ? "-" : "") + head + (rest.length ? "." + rest.join("") : "");
}

export const faDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const grouped = (value: string | number) => {
  const raw = digitsOnly(String(value ?? ""));
  if (!raw) return "";
  return faDigits(raw.replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
};

// ----------------------------------------------------------------- field ---

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optionalNote?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  optionalNote,
  children,
  className = "",
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-14 leading-24 font-m text-black mb-8">
        {label}
        {required && (
          <span className="text-error-light mr-2" aria-hidden="true">
            *
          </span>
        )}
        {optionalNote && <span className="text-12 font-l text-gray-77828F mr-6">(اختیاری)</span>}
      </label>

      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}

      {/*
        The message sits under the field it belongs to, and the slot keeps its
        height so the page does not jump a line every time one appears.
      */}
      <div className="min-h-[20px] mt-6">
        {error ? (
          <p id={errorId} role="alert" className="text-12 leading-20 text-error-light font-m">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-12 leading-20 text-gray-77828F font-l">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- inputs ---

const inputBase =
  "w-full h-[52px] px-16 rounded-12 bg-white border text-14 font-m text-black placeholder:text-gray-A9B1BC placeholder:font-l outline-none transition-colors focus:border-primary-main focus:ring-2 focus:ring-primary-light";

const borderFor = (invalid?: boolean) =>
  invalid ? "border-error-light" : "border-gray-DBDFE5 hover:border-gray-A9B1BC";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(function TextInput(
  { invalid, className = "", ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      {...rest}
      className={`${inputBase} ${borderFor(invalid)} ${className}`}
    />
  );
});

export function TextArea({
  invalid,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      className={`w-full min-h-[120px] p-16 rounded-12 bg-white border text-14 leading-26 font-r text-black placeholder:text-gray-A9B1BC placeholder:font-l outline-none resize-y transition-colors focus:border-primary-main focus:ring-2 focus:ring-primary-light ${borderFor(
        invalid
      )} ${className}`}
    />
  );
}

/** A text input that will only ever contain digits. */
export function NumberInput({
  value,
  onValueChange,
  suffix,
  invalid,
  ...rest
}: Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        {...rest}
        value={faDigits(value)}
        inputMode="numeric"
        onChange={(e) => onValueChange(digitsOnly(e.target.value))}
        className={`${inputBase} ${borderFor(invalid)} ${suffix ? "pl-56" : ""}`}
      />
      {suffix && (
        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-12 font-l text-gray-77828F pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/**
 * Money, grouped as it is typed.
 *
 * The grouped value is what the host sees; the digits are what leaves. Reading
 * back a seven-digit price without separators is the single most reliable way
 * to let someone list a villa for a tenth of what they meant.
 */
export function MoneyInput({
  value,
  onValueChange,
  invalid,
  ...rest
}: Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        {...rest}
        value={grouped(value)}
        inputMode="numeric"
        onChange={(e) => onValueChange(digitsOnly(e.target.value))}
        className={`${inputBase} ${borderFor(invalid)} pl-64`}
      />
      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-12 font-l text-gray-77828F pointer-events-none">
        تومان
      </span>
    </div>
  );
}

// --------------------------------------------------------------- choices ---

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string;
  disabled?: boolean;
  /**
   * Reserve the picture area even when this tile has no picture.
   *
   * Set for every tile in a group where at least one has artwork, so a group
   * is not a ragged mix of tall and short cards. Without it, one configured
   * image among eight makes the grid look broken.
   */
  reserveMedia?: boolean;
}

/**
 * A picture-led choice tile.
 *
 * A real `<button>` with `aria-pressed`, not a styled div: it has to be
 * reachable by keyboard and announce its state, and it has to feel pressed the
 * instant it is tapped rather than when the network comes back.
 */
export function OptionCard({
  selected,
  onSelect,
  title,
  description,
  imageUrl,
  icon,
  disabled,
  reserveMedia,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative w-full text-right rounded-16 border-2 overflow-hidden transition-all duration-150 active:scale-[0.99] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 ${
        selected
          ? "border-primary-main bg-primary-light/40 shadow-[0_2px_12px_rgba(3,214,187,0.18)]"
          : "border-gray-DBDFE5 bg-white hover:border-gray-A9B1BC"
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="w-full h-[104px] object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : reserveMedia ? (
        <span className="flex w-full h-[104px] bg-gray-F3F5F7 items-center justify-center">
          <i className={`${icon || "icon-Home"} text-28 text-gray-A9B1BC`} />
        </span>
      ) : null}

      <span className="flex items-start gap-x-12 p-16">
        {icon && !imageUrl && (
          <i className={`${icon} text-24 shrink-0 ${selected ? "text-primary-dark" : "text-gray-77828F"}`} />
        )}
        <span className="grow">
          <span className="block text-14 leading-24 font-b text-black">{title}</span>
          {description && (
            <span className="block text-12 leading-20 font-l text-gray-77828F mt-4">{description}</span>
          )}
        </span>
        <span
          className={`shrink-0 w-20 h-20 rounded-full border-2 grid place-items-center mt-2 ${
            selected ? "border-primary-main bg-primary-main" : "border-gray-DBDFE5"
          }`}
        >
          {selected && <i className="icon-Tick text-10 text-white" />}
        </span>
      </span>
    </button>
  );
}

/** A compact checkbox tile, for lists where many can be on at once. */
export function CheckCard({
  checked,
  onToggle,
  label,
  icon,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  icon?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-12 border transition-colors ${
        checked ? "border-primary-main bg-primary-light/30" : "border-gray-DBDFE5 bg-white"
      }`}
    >
      <label className="flex items-center gap-x-12 p-14 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-20 h-20 shrink-0 accent-primary-main cursor-pointer"
        />
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" className="w-24 h-24 object-contain shrink-0" loading="lazy" />
        ) : null}
        <span className="text-14 leading-24 font-m text-black">{label}</span>
      </label>
      {checked && children ? <div className="px-14 pb-14">{children}</div> : null}
    </div>
  );
}

/** −  N  + . The label is the accessible name of both buttons. */
export function Counter({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const step = (delta: number) => onChange(Math.max(min, Math.min(max, value + delta)));
  const btn =
    "w-36 h-36 shrink-0 rounded-full border border-gray-DBDFE5 grid place-items-center text-black transition-colors hover:border-primary-main hover:text-primary-dark disabled:opacity-40 disabled:hover:border-gray-DBDFE5 disabled:hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main";

  return (
    <div className="flex items-center gap-x-12">
      <button
        type="button"
        className={btn}
        onClick={() => step(-1)}
        disabled={value <= min}
        aria-label={`کاهش ${label}`}
      >
        <i className="icon-Negative text-16" />
      </button>
      <span
        className="min-w-[32px] text-center text-16 font-b text-black tabular-nums"
        aria-live="polite"
        aria-label={`${label}: ${value}`}
      >
        {faDigits(value)}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => step(1)}
        disabled={value >= max}
        aria-label={`افزایش ${label}`}
      >
        <i className="icon-Plus text-16" />
      </button>
    </div>
  );
}

/** A labelled row with a counter on the end — the shape most capacity rows want. */
export function CounterRow({
  label,
  description,
  ...counter
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-x-16 py-14 border-b border-gray-F3F5F7 last:border-b-0">
      <div className="grow">
        <p className="text-14 leading-24 font-m text-black">{label}</p>
        {description && (
          <p className="text-12 leading-20 font-l text-gray-77828F mt-2">{description}</p>
        )}
      </div>
      <Counter label={label} {...counter} />
    </div>
  );
}

// -------------------------------------------------------------- feedback ---

export function Callout({
  tone = "info",
  children,
  action,
}: {
  tone?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const tones = {
    info: "bg-blue-light border-blue-main/20 text-black",
    warning: "bg-yellow-light border-warning/30 text-black",
    error: "bg-red-light border-error-light/30 text-black",
    success: "bg-green-light border-success/25 text-black",
  } as const;
  const icons = {
    info: "icon-Information text-blue-main",
    warning: "icon-Warning text-warning",
    error: "icon-ErrorFill text-error-light",
    success: "icon-Success text-success",
  } as const;

  return (
    <div className={`flex items-start gap-x-12 p-14 rounded-12 border ${tones[tone]}`}>
      <i className={`${icons[tone]} text-20 shrink-0 mt-2`} />
      <div className="grow text-13 leading-22 font-l">{children}</div>
      {action}
    </div>
  );
}

/** Idle, saving, saved, failed — the four states a host needs distinguished. */
export function SaveStatus({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;

  const map = {
    saving: { icon: "icon-Refresh animate-spin", text: "در حال ذخیره…", tone: "text-gray-77828F" },
    saved: { icon: "icon-Success", text: "ذخیره شد", tone: "text-success" },
    error: { icon: "icon-ErrorFill", text: "ذخیره نشد", tone: "text-error-light" },
  } as const;
  const { icon, text, tone } = map[state];

  return (
    <span className={`flex items-center gap-x-6 text-12 font-m ${tone}`} role="status" aria-live="polite">
      <i className={`${icon} text-14`} />
      {text}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-20 h-20 rounded-full border-2 border-gray-DBDFE5 border-t-primary-main animate-spin ${className}`}
      role="status"
      aria-label="در حال بارگذاری"
    />
  );
}

export function StepSkeleton() {
  return (
    <div className="animate-pulse space-y-16" aria-hidden="true">
      <div className="h-28 w-1/2 rounded-8 bg-gray-F3F5F7" />
      <div className="h-16 w-3/4 rounded-8 bg-gray-F3F5F7" />
      <div className="h-[52px] rounded-12 bg-gray-F3F5F7" />
      <div className="h-[52px] rounded-12 bg-gray-F3F5F7" />
      <div className="h-[120px] rounded-12 bg-gray-F3F5F7" />
    </div>
  );
}

/** Groups a handful of fields under a quiet heading. */
export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-24 ${className}`}>
      {title && <h3 className="text-15 leading-26 font-b text-black mb-4">{title}</h3>}
      {description && (
        <p className="text-12 leading-20 font-l text-gray-77828F mb-12">{description}</p>
      )}
      {children}
    </section>
  );
}

/** A time-of-day picker that stores "HH:MM" and never lets a stray value in. */
export function TimeSelect({
  value,
  onChange,
  invalid,
  id,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  const options = useMemo(
    () => Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`),
    []
  );

  return (
    <select
      id={id}
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} ${borderFor(invalid)} appearance-none cursor-pointer`}
    >
      <option value="">انتخاب کنید</option>
      {options.map((time) => (
        <option key={time} value={time}>
          {faDigits(time)}
        </option>
      ))}
    </select>
  );
}
