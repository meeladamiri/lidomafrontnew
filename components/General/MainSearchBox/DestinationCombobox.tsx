import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPopularDestinations, ICityOrProvince } from "@/api/Search/getPopularDestination";
import {
  getSearchKeywordResults,
  ISearchKeywordResultsData,
} from "@/api/Search/getSearchKeywordResults";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";

export interface DestinationChoice {
  /** What goes in the URL: a curated English slug, or the Persian name. */
  slug: string;
  /** What the input shows. */
  label: string;
  /** A residence goes straight to its own page instead of a search. */
  href?: string;
}

interface Option extends DestinationChoice {
  id: string;
  kind: "city" | "province" | "residence";
  count?: number;
  /** Only the curated popular cities have one. Keyword matches do not. */
  image?: string;
}

/**
 * The destination field of the hero search box: a WAI-ARIA combobox.
 *
 * What it replaces used to be a text input inside a `div` with an `onClick`
 * that toggled a panel — the panel could not be reached or dismissed from the
 * keyboard, nothing was announced to a screen reader, and typing a city without
 * clicking a row left the search with no destination at all, so it silently
 * searched the whole country.
 *
 * Here the input owns the listbox (`aria-controls` / `aria-activedescendant`),
 * arrow keys move the active option, Enter takes it, Escape closes, and free
 * text is a legitimate answer — the backend matches Persian place names, so
 * "شیراز" typed and submitted goes where the reader expects.
 */
function DestinationCombobox({
  value,
  onChange,
  onSelect,
  onSubmitFreeText,
  inputName,
  inputId,
  labelId,
  placeholder = "کجا می‌خواهید بروید؟",
  open,
  setOpen,
  inputClassName = "",
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (choice: DestinationChoice) => void;
  /** Enter with no active option — let the form submit. */
  onSubmitFreeText?: () => void;
  inputName: string;
  inputId: string;
  labelId: string;
  placeholder?: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  inputClassName?: string;
}) {
  const listboxId = useId();
  const [activeIndex, setActiveIndex] = useState(-1);
  /**
   * Photos that failed to load, by option id.
   *
   * A raw `<img>` to external storage has no retry and no fallback of its
   * own — a network hiccup on just this one request, or a photo the migration
   * script never wrote, renders the browser's broken-image glyph in a list
   * next to eleven photos that loaded fine. Once an id lands here it renders
   * the pin icon instead, same as an option that never had a photo.
   */
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const markFailed = useCallback(
    (id: string) => setFailedImages((previous) => new Set(previous).add(id)),
    []
  );
  const [debounced, setDebounced] = useState(value);
  const listRef = useRef<HTMLUListElement>(null);

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value]);

  const { data: popular, isLoading: popularLoading } = useQuery(
    ["getPopularDestinations"],
    () => getPopularDestinations(),
    { staleTime: 10 * 60 * 1000 }
  );

  const { data: matches, isFetching } = useQuery(
    ["destinationSearch", debounced],
    () => getSearchKeywordResults({ name: debounced }),
    { enabled: debounced.length > 0, keepPreviousData: true, staleTime: 60 * 1000 }
  );

  const options: Option[] = useMemo(() => {
    if (!debounced) {
      const cities = ((popular?.params as any)?.cities ?? []) as ICityOrProvince[];
      return cities.map((c) => ({
        id: `popular-${c.id}`,
        kind: "city" as const,
        // The curated English slug is the canonical URL; the Persian name is
        // the fallback the backend also understands.
        slug: c.title_en || c.name,
        label: c.name,
        count: c.count,
        image: c.image || undefined,
      }));
    }

    const params = matches?.params as ISearchKeywordResultsData | undefined;
    const places = (params?.categories ?? []).map((c) => ({
      id: `place-${c.type}-${c.id}`,
      kind: (c.type === "province" ? "province" : "city") as "city" | "province",
      slug: c.title_en || c.name,
      label: c.name,
      count: c.count,
    }));
    const residences = (params?.residences ?? []).map((r) => ({
      id: `res-${r.id}`,
      kind: "residence" as const,
      slug: String(r.id),
      label: r.name,
      href: getPropertyPageUrl({ residenceId: r.id }),
    }));

    return [...places, ...residences];
  }, [debounced, popular, matches]);

  // A stale highlight after the list changes would send Enter somewhere the
  // reader never looked at. Keyed on the query only: including `open` here
  // meant a re-render that reopened the panel wiped a highlight the reader had
  // just moved onto.
  useEffect(() => setActiveIndex(-1), [debounced]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (option: Option) => {
    onChange(option.label);
    // Closing and advancing are both parent state writes in one batch, so
    // onSelect runs last — otherwise the close overwrote the panel it opens.
    setOpen(false);
    onSelect(option);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;

      // Opening and highlighting are one keypress, not two. Requiring a second
      // press to move onto the first option is the kind of thing that reads as
      // "the arrow keys don't work".
      if (!open) setOpen(true);
      if (!options.length) return;

      setActiveIndex((i) => {
        if (i < 0) return step > 0 ? 0 : options.length - 1;
        const next = i + step;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (e.key === "Enter") {
      if (open && activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault();
        choose(options[activeIndex]);
        return;
      }
      // No highlight: the typed text is the answer. The form handles it.
      setOpen(false);
      onSubmitFreeText?.();
      return;
    }

    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
      return;
    }

    if (e.key === "Home" && open) {
      e.preventDefault();
      setActiveIndex(0);
    }
    if (e.key === "End" && open) {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  const loading = debounced ? isFetching && !matches : popularLoading;

  return (
    <>
      <input
        id={inputId}
        name={inputName}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-labelledby={labelId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`w-full bg-transparent outline-none ${inputClassName}`}
      />

      {open && (
        <div className="absolute z-20 right-0 -bottom-8 translate-y-full w-[340px] max-w-[90vw] bg-white rounded-16 shadow-[0px_8px_32px_rgba(24,39,58,0.15)] overflow-hidden">
          <div className="px-20 pt-16 pb-8">
            <p className="text-12 leading-18 text-gray-959FA7 font-r">
              {debounced ? "نتیجه‌های جستجو" : "مقصدهای محبوب"}
            </p>
          </div>

          {/* Screen readers get the count without the list having to be read. */}
          <p className="sr-only" role="status" aria-live="polite">
            {loading
              ? "در حال جستجو"
              : options.length
              ? `${options.length} نتیجه`
              : "نتیجه‌ای پیدا نشد"}
          </p>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-[260px] overflow-y-auto pb-8"
          >
            {loading && (
              <li className="py-16">
                <TinyLoader />
              </li>
            )}

            {!loading && options.length === 0 && (
              <li className="px-20 py-14 text-13 leading-20 text-gray-6C6A7D font-r">
                چیزی پیدا نشد. می‌تونی همین متن رو جستجو کنی.
              </li>
            )}

            {!loading &&
              options.map((option, index) => (
                <li
                  key={option.id}
                  id={`${listboxId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  // `onMouseDown` rather than `onClick`: the input's blur would
                  // otherwise close the list before the click landed.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-20 py-8 flex items-center gap-x-12 cursor-pointer transition-colors ${
                    index === activeIndex ? "bg-gray-F0F0F0" : ""
                  }`}
                >
                  {/*
                    The city photograph, where there is one. These arrived with
                    scripts/migrate-odoo-location-images.ts — before it every
                    location had imageUrl null, so this list was a column of
                    identical grey pins with no way to tell one destination from
                    another at a glance. Keyword matches have no image, and the
                    pin still stands in for them.

                    A plain <img>, not next/image: these are 40px thumbnails in
                    a dropdown that most visitors never open, and routing twelve
                    of them through the optimiser on every home page load costs
                    more than it saves. loading="lazy" keeps them off the
                    critical path.
                  */}
                  {option.image && !failedImages.has(option.id) ? (
                    <img
                      src={option.image}
                      alt=""
                      loading="lazy"
                      width={40}
                      height={40}
                      onError={() => markFailed(option.id)}
                      className="w-40 h-40 rounded-8 object-cover shrink-0 bg-gray-F0F0F0"
                    />
                  ) : (
                    <i
                      aria-hidden="true"
                      className={`text-20 text-gray-959FA7 ${
                        option.kind === "residence" ? "icon-Home" : "icon-Location"
                      }`}
                    />
                  )}
                  <span className="text-14 leading-20 text-black font-r truncate">
                    {option.label}
                  </span>
                  {option.kind !== "residence" && !!option.count && (
                    <span className="mr-auto shrink-0 text-11 leading-16 text-gray-959FA7 font-r">
                      {option.count} اقامتگاه
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default DestinationCombobox;
