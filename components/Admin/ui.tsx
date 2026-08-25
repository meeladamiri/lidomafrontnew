import React from "react";

// Shared Tailwind building blocks for the redesigned admin panel.
// Everything here is presentational — no data fetching.

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-16 border border-gray-E5E5E6 ${className}`}>{children}</div>
  );
}

const TONES = {
  green: "bg-[#03D6BB14] text-[#015046]",
  gray: "bg-gray-F0F0F0 text-gray-6C6A7D",
  yellow: "bg-[#FFF4E0] text-[#B26A00]",
  red: "bg-[#FFEBEB] text-[#C62828]",
  blue: "bg-[#E8F1FF] text-[#1B4F9C]",
  purple: "bg-[#F1EAFE] text-[#5B32B0]",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({
  tone = "gray",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-x-4 px-10 py-4 rounded-8 text-12 leading-18 font-m ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-primary-main text-white hover:opacity-90",
    secondary: "bg-white text-black border border-gray-E5E5E6 hover:bg-gray-F7F7F7",
    danger: "bg-[#E53935] text-white hover:opacity-90",
    ghost: "bg-transparent text-gray-6C6A7D hover:bg-gray-F0F0F0",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-x-6 px-16 py-10 rounded-10 text-14 leading-20 font-m transition disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition ${className}`}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 bg-white outline-none focus:border-primary-main transition ${className}`}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  children,
  className = "",
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Small note under the input — used for SEO length limits and warnings. */
  hint?: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>
      {children}
      {!!hint && <span className="block mt-4 text-11 leading-18 text-gray-B0AFBC">{hint}</span>}
    </label>
  );
}

// Colored metric tile used across the dashboard and the user detail header.
const TILE_GRADIENTS = {
  blue: "from-[#3B82F6] to-[#2563EB]",
  orange: "from-[#FB923C] to-[#F97316]",
  red: "from-[#F43F5E] to-[#E11D48]",
  green: "from-[#34D399] to-[#10B981]",
  purple: "from-[#A855F7] to-[#7C3AED]",
  teal: "from-[#2DD4BF] to-[#0D9488]",
} as const;

export function StatTile({
  label,
  value,
  hint,
  tone = "blue",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: keyof typeof TILE_GRADIENTS;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gradient-to-bl ${TILE_GRADIENTS[tone]} text-white rounded-16 p-16 flex flex-col gap-y-8`}
    >
      <div className="flex items-center justify-between">
        <span className="text-12 leading-18 opacity-90">{label}</span>
        {!!icon && <span className="opacity-80">{icon}</span>}
      </div>
      <strong className="text-20 leading-28 font-m">{value}</strong>
      {!!hint && <span className="text-11 leading-16 opacity-85">{hint}</span>}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-40 text-center text-14 leading-22 text-gray-6C6A7D">{text}</div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-F0F0F0 rounded-10 ${className}`} />;
}

// Simple centered modal — used for create/confirm/yellow-card dialogs.
export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-[520px]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-16"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-16 w-full ${width} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-20 py-16 border-b border-gray-E5E5E6">
          <h2 className="text-16 leading-24 font-m text-black">{title}</h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-28 h-28 rounded-8 text-gray-6C6A7D hover:bg-gray-F0F0F0 leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-20">{children}</div>
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Renders the switch with a caption beside it. */
  label?: React.ReactNode;
}) {
  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-40 h-22 rounded-full transition disabled:opacity-50 ${
        checked ? "bg-primary-main" : "bg-gray-D2D2D7"
      }`}
    >
      <span
        className={`absolute top-2 w-18 h-18 bg-white rounded-full transition-all ${
          checked ? "right-2" : "right-20"
        }`}
      />
    </button>
  );

  if (!label) return button;
  return (
    <span className="inline-flex items-center gap-x-8">
      {button}
      <span className="text-12 leading-20 text-gray-6C6A7D">{label}</span>
    </span>
  );
}

// ---------- page toolbar ----------
// The shared control strip every list screen carries: search, filters,
// grouping, refresh, range-style pagination, and the view switcher.

export type ViewMode = "list" | "cards" | "chart";

export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <Card className="px-16 py-12 flex items-center justify-between gap-x-16 gap-y-12 flex-wrap">
      {children}
    </Card>
  );
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder = "جستجو",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[220px] max-w-[420px]">
      <i className="icon-Search absolute right-12 top-1/2 -translate-y-1/2 text-16 text-gray-9B9BAA pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-36 pl-14 py-10 rounded-10 bg-gray-F5F5F7 text-14 leading-22 outline-none focus:bg-white focus:ring-1 focus:ring-primary-main transition"
      />
    </div>
  );
}

export function ToolbarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-x-6 px-12 py-8 rounded-10 text-14 leading-20 transition ${
        active ? "bg-primary-light text-primary-dark" : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
      }`}
    >
      <i className={`${icon} text-16`} />
      {label}
    </button>
  );
}

export function ToolbarIconButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-32 h-32 rounded-10 flex items-center justify-center text-gray-6C6A7D hover:bg-gray-F0F0F0 disabled:opacity-40 disabled:hover:bg-transparent transition"
    >
      <i className={`${icon} text-16`} />
    </button>
  );
}

/** "۱-۲۰ / ۱٬۵۲۴" range pager with prev/next, matching the design. */
export function ToolbarPager({
  page,
  pageSize,
  total,
  pageCount,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center gap-x-4">
      <ToolbarIconButton
        icon="icon-FlashRight"
        label="صفحه قبل"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      />
      <span className="text-13 leading-20 text-gray-6C6A7D whitespace-nowrap px-4">
        {faNum(from)}-{faNum(to)} / {faNum(total)}
      </span>
      <ToolbarIconButton
        icon="icon-FlashLeft"
        label="صفحه بعد"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      />
    </div>
  );
}

export function ViewSwitch({
  value,
  onChange,
  modes = ["list", "cards"],
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  modes?: ViewMode[];
}) {
  const CONFIG: Record<ViewMode, { icon: string; label: string }> = {
    list: { icon: "icon-Rows-Sorting", label: "نمایش لیست" },
    cards: { icon: "icon-CardMenu", label: "نمایش کارتی" },
    chart: { icon: "icon-Amaar", label: "نمایش نموداری" },
  };

  return (
    <div className="flex items-center gap-x-2 bg-gray-F5F5F7 rounded-10 p-3">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          title={CONFIG[m].label}
          aria-pressed={value === m}
          className={`w-32 h-28 rounded-8 flex items-center justify-center transition ${
            value === m ? "bg-primary-main text-white" : "text-gray-6C6A7D hover:bg-white"
          }`}
        >
          <i className={`${CONFIG[m].icon} text-16`} />
        </button>
      ))}
    </div>
  );
}

/** Pill tabs with counts, used above list tables. */
export function TabPills<T extends string>({
  tabs,
  value,
  counts,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  value: T;
  counts?: Partial<Record<T, number>>;
  onChange: (t: T) => void;
}) {
  return (
    <div className="flex items-center gap-x-6 flex-wrap gap-y-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          aria-pressed={value === t.key}
          className={`px-12 py-6 rounded-10 text-13 leading-20 font-m transition ${
            value === t.key
              ? "bg-primary-main text-white"
              : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
          }`}
        >
          {t.label}
          {counts?.[t.key] !== undefined && (
            <span className="mr-4 opacity-75">({faNum(counts[t.key])})</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Floating action bar shown while rows are multi-selected. */
export function SelectionBar({
  count,
  onClear,
  actions,
}: {
  count: number;
  onClear: () => void;
  actions: { icon: string; label: string; onClick: () => void; danger?: boolean }[];
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white rounded-14 shadow-[0_8px_32px_rgba(24,39,58,0.18)] border border-gray-E5E5E6 px-12 py-10 flex items-center gap-x-8">
      <button
        onClick={onClear}
        aria-label="لغو انتخاب"
        title="لغو انتخاب"
        className="w-32 h-32 rounded-10 flex items-center justify-center text-gray-6C6A7D hover:bg-gray-F0F0F0 transition"
      >
        <i className="icon-Close text-16" />
      </button>
      <span className="w-px h-20 bg-gray-E5E5E6" />
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          title={a.label}
          aria-label={a.label}
          className={`w-32 h-32 rounded-10 flex items-center justify-center transition ${
            a.danger
              ? "text-[#E53935] hover:bg-[#FFEBEB]"
              : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
          }`}
        >
          <i className={`${a.icon} text-16`} />
        </button>
      ))}
      <span className="w-px h-20 bg-gray-E5E5E6" />
      <span className="inline-flex items-center gap-x-6 text-13 leading-20 text-black whitespace-nowrap pl-4">
        <span className="w-22 h-22 rounded-full bg-primary-main text-white text-11 flex items-center justify-center">
          {faNum(count)}
        </span>
        مورد انتخاب شده
      </span>
    </div>
  );
}

/** Per-row "⋮" dropdown. */
export function RowMenu({
  items,
}: {
  items: { icon: string; label: string; onClick: () => void; danger?: boolean }[];
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="عملیات"
        aria-expanded={open}
        className="w-28 h-28 rounded-8 flex items-center justify-center text-gray-6C6A7D hover:bg-gray-F0F0F0 transition"
      >
        <i className="icon-Details text-16" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-4 z-30 w-[190px] bg-white rounded-12 border border-gray-E5E5E6 shadow-[0_8px_24px_rgba(24,39,58,0.14)] py-6"
        >
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={`w-full px-14 py-8 flex items-center gap-x-10 text-13 leading-20 text-right transition ${
                it.danger ? "text-[#E53935] hover:bg-[#FFEBEB]" : "text-black hover:bg-gray-F5F5F7"
              }`}
            >
              <i className={`${it.icon} text-16 shrink-0`} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="w-16 h-16 rounded-4 accent-primary-main cursor-pointer align-middle"
    />
  );
}

/** Read-only 5-star rating with an optional review count. */
export function Stars({ value, count }: { value: number; count?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-x-2 text-13" title={`${value.toFixed(1)} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={`${i < full ? "icon-StarFill text-[#FFB800]" : "icon-Star text-gray-D2D2D7"} text-13`}
        />
      ))}
      {count !== undefined && <span className="text-gray-6C6A7D mr-4">({faNum(count)})</span>}
    </span>
  );
}

// Liara object storage 404s any request whose User-Agent contains "Mozilla",
// so a browser <img src> pointed straight at it never loads. Every admin
// image goes through Next's optimizer, which fetches server-side.
export function adminImageUrl(url: string | null | undefined, w = 640) {
  if (!url) return "";
  if (!url.startsWith("http")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=70`;
}

export const faNum = (n: number | null | undefined) => (n ?? 0).toLocaleString("fa-IR");
export const faMoney = (n: number | null | undefined) => `${(n ?? 0).toLocaleString("fa-IR")} تومان`;

export function faDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short" }).format(new Date(value));
  } catch {
    return "-";
  }
}
