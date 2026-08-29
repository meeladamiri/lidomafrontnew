import { MouseEvent } from "react";

/**
 * The little ✕ that clears a filter chip.
 *
 * It used to be a bare `<i>` with an onClick: no accessible name, no role, and
 * no way to reach it from the keyboard. Callers were already passing
 * `aria-label` — but the component never declared the prop, and because it is
 * loaded through `next/dynamic` (which types as `any`) nothing complained and
 * the label was dropped on the floor. So a screen reader announced nothing at
 * all, and a keyboard user could apply a filter but never remove it.
 *
 * A real `<button>` fixes all three at once. `type="button"` matters: these sit
 * inside forms on some pages, where the default `submit` would search instead
 * of clearing.
 */
function CloseBtn({
  onClose,
  closeIconClassname,
  "aria-label": ariaLabel = "حذف فیلتر",
}: {
  onClose: (e: MouseEvent<HTMLElement, globalThis.MouseEvent>) => void;
  closeIconClassname?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => onClose(e)}
      className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
    >
      <i
        aria-hidden="true"
        className={`icon-ErrorFill text-gray-400 text-20 cursor-pointer ${
          closeIconClassname || ""
        }`}
      />
    </button>
  );
}

export default CloseBtn;
