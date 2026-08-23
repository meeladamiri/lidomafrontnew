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
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>
      {children}
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
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
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
