import Image from "next/image";

/**
 * A pickable option in the wizard's first steps.
 *
 * The version this replaces was a `div` with an `onClick` that showed nothing
 * at all between the tap and the next screen. On a phone on a slow connection
 * that is a second of a host wondering whether the site heard them, and the
 * natural response is to tap again — which used to fire a second request.
 *
 * So: a real button, a visible pressed state, a spinner on the tile that was
 * actually chosen, and everything else dimmed while the save is in flight.
 */

interface Props {
  label: string;
  description?: string;
  imageUrl?: string;
  selected?: boolean;
  pending?: boolean;
  /** Another tile is saving; this one should look unavailable but stay legible. */
  dimmed?: boolean;
  onSelect: () => void;
  className?: string;
}

function OptionTile({
  label,
  description,
  imageUrl,
  selected,
  pending,
  dimmed,
  onSelect,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={pending || dimmed}
      aria-pressed={!!selected}
      aria-busy={!!pending}
      className={[
        "group relative flex w-full flex-col overflow-hidden rounded-12 border-1 border-solid bg-white text-right transition-all",
        selected
          ? "border-primary-main shadow-[0_0_0_2px_rgba(0,0,0,0.04)]"
          : "border-gray-EFEFEF hover:border-gray-CACFD3",
        dimmed && !pending ? "opacity-50" : "",
        pending ? "border-primary-main" : "",
        "disabled:cursor-default",
        className,
      ].join(" ")}
    >
      <span className="relative block aspect-square w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 767px) 45vw, 220px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gray-F5F5F7">
            <i aria-hidden="true" className="icon-Homes text-32 text-gray-CACFD3" />
          </span>
        )}

        {/* The tick confirms the choice landed even before the screen changes. */}
        {selected && !pending && (
          <span className="absolute right-8 top-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary-main text-white">
            <i aria-hidden="true" className="icon-Tick text-14" />
          </span>
        )}

        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <span
              aria-hidden="true"
              className="h-24 w-24 animate-spin rounded-full border-2 border-solid border-gray-EFEFEF border-t-primary-main"
            />
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col px-10 py-10">
        <span
          className={`text-14 leading-24 font-m ${selected ? "text-primary-main" : "text-black"}`}
        >
          {label}
        </span>
        {description && (
          <span className="mt-2 text-12 leading-20 font-r text-gray-6C6A7D">{description}</span>
        )}
      </span>
    </button>
  );
}

export default OptionTile;
