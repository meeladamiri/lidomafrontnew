import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDraft, type Draft, type Err, type Result } from "@/api/Residences/hostWizard";
import { legacyStep, resumeIndex, STEPS, TOTAL_STEPS, type WizardStepDef } from "./steps";

/**
 * One draft, one request, one place that knows how to save it.
 *
 * The previous wizard refetched the residence on every step under a cache key
 * that included the step number, so the cache could never hit — eleven blocking
 * fetches of one object. It then had to freeze the first snapshot per mount,
 * because saving invalidated the query and the background refetch would land
 * mid-typing and wipe the field the host was in.
 *
 * Both problems have the same root: treating a save as "something changed, go
 * and find out what". The server already answers a save with the updated row,
 * so this writes that answer straight into the cache. No refetch, nothing to
 * race, nothing to freeze.
 */

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveOptions {
  /**
   * Relations the endpoint does not return (city name, rooms, images) are
   * stale after this save, so re-read. Costs a request; most steps do not
   * need it.
   */
  reload?: boolean;
}

interface WizardValue {
  residenceId?: number;
  draft?: Draft;
  isLoading: boolean;
  loadError?: string;
  reload: () => Promise<unknown>;

  index: number;
  step: WizardStepDef;
  goTo: (index: number) => void;
  next: () => void;
  back: () => void;
  /** How far the host may jump ahead: no skipping past an unfilled gate. */
  maxReachable: number;

  /**
   * Runs one step's write and reports whether it stuck.
   *
   * Generic in what the endpoint answers, because not all of them answer with
   * the residence: reordering photos returns a bare acknowledgement. Only a
   * response that actually looks like the draft is merged into the cache.
   */
  save: <T>(
    run: (residenceId: number) => Promise<Result<T>>,
    options?: SaveOptions
  ) => Promise<boolean>;
  saveState: SaveState;
  error?: Err;
  clearError: () => void;
  /** Field name to messages, straight from the server's last rejection. */
  fieldErrors: Record<string, string[]>;

  dirty: boolean;
  setDirty: (value: boolean) => void;

  /** The value to send as `step` so the server's progress marker keeps up. */
  progressMarker: number;
}

const WizardContext = createContext<WizardValue | null>(null);

export function useWizard(): WizardValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}

const queryKeyFor = (id?: number) => ["hostResidenceDraft", id] as const;

/**
 * Merges a save's response into the cached draft.
 *
 * Most endpoints answer with the residence row alone — no images, no rooms, no
 * location. A spread keeps the keys the response never mentioned, so replying
 * to a pricing save does not quietly empty the gallery held in the cache.
 */
function merge(previous: Draft | undefined, incoming: unknown): Draft | undefined {
  if (!isDraftLike(incoming)) return previous;
  if (!previous) return incoming;
  return { ...previous, ...incoming };
}

/** An endpoint that answered with the residence, rather than with "done". */
function isDraftLike(value: unknown): value is Draft {
  return !!value && typeof value === "object" && typeof (value as Draft).id === "number";
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const residenceId = useMemo(() => {
    const raw = Number(router.query?.productId);
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  }, [router.query?.productId]);

  const {
    data: draft,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeyFor(residenceId),
    queryFn: async () => {
      const res = await getDraft(residenceId as number);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    enabled: !!residenceId,
    // Nothing but this wizard writes to the draft, and every write updates the
    // cache from its own response.
    staleTime: Infinity,
    retry: 1,
  });

  // ------------------------------------------------------------ position ---

  /**
   * Where the host is.
   *
   * The URL is the source of truth so back/forward and a refresh all behave,
   * but it is clamped: links from the dashboard and the listing cards were
   * built for the old fifteen-step numbering and still carry values like
   * `step=11`. Rather than break them or land someone on the wrong screen,
   * an out-of-range request resolves to the first thing they have not done.
   */
  const requested = Number(router.query?.step);
  const resume = resumeIndex(draft);
  const maxReachable = draft ? Math.max(resume, 0) : 0;

  const index = useMemo(() => {
    if (!Number.isFinite(requested)) return resume;
    if (requested < 0 || requested >= TOTAL_STEPS) return resume;
    // Free movement backwards over finished work; forward only to the gap.
    return Math.min(requested, Math.max(maxReachable, 0));
  }, [requested, resume, maxReachable]);

  const step = STEPS[index] ?? STEPS[0];

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(target, TOTAL_STEPS - 1));
      const query: Record<string, string> = { step: String(clamped) };
      if (residenceId) query.productId = String(residenceId);
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [residenceId, router]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const back = useCallback(() => goTo(index - 1), [goTo, index]);

  // -------------------------------------------------------------- saving ---

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<Err | undefined>();
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const mutation = useMutation({
    mutationFn: async ({
      run,
      options,
    }: {
      run: (residenceId: number) => Promise<Result<unknown>>;
      options?: SaveOptions;
    }) => {
      if (!residenceId) throw new Error("NO_RESIDENCE");
      const result = await run(residenceId);
      if (!result.ok) throw result;
      if (options?.reload) {
        await refetch();
      } else {
        queryClient.setQueryData(queryKeyFor(residenceId), (prev?: Draft) =>
          merge(prev, result.data)
        );
      }
      return result.data;
    },
  });

  const save = useCallback(
    async <T,>(
      run: (residenceId: number) => Promise<Result<T>>,
      options?: SaveOptions
    ): Promise<boolean> => {
      // A second press while the first is in flight is the same press.
      if (mutation.isLoading) return false;
      setSaveState("saving");
      setError(undefined);
      try {
        await mutation.mutateAsync({ run, options });
        setSaveState("saved");
        clearTimeout(savedTimer.current);
        // «ذخیره شد» fades; a badge that never leaves stops being read.
        savedTimer.current = setTimeout(() => setSaveState("idle"), 2500);
        return true;
      } catch (err: any) {
        setSaveState("error");
        setError(
          err && typeof err === "object" && "ok" in err
            ? (err as Err)
            : { ok: false, message: "ذخیره نشد. دوباره تلاش کنید." }
        );
        return false;
      }
    },
    [mutation]
  );

  // --------------------------------------------------- unsaved-work guard ---

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (url: string) => {
      // Moving between steps of this wizard is not leaving it.
      if (url.split("?")[0] === router.pathname) return;
      if (window.confirm("تغییرات ذخیره‌نشده دارید. از این صفحه خارج می‌شوید؟")) return;
      router.events.emit("routeChangeError");
      // Next has no cancel API; throwing out of the handler is the documented
      // way to abort a client-side navigation.
      // eslint-disable-next-line no-throw-literal
      throw "ROUTE_CHANGE_ABORTED";
    };
    router.events.on("routeChangeStart", guard);
    return () => router.events.off("routeChangeStart", guard);
  }, [dirty, router]);

  const value: WizardValue = {
    residenceId,
    draft,
    isLoading: !!residenceId && isLoading,
    loadError: queryError ? (queryError as Error).message : undefined,
    reload: refetch,

    index,
    step,
    goTo,
    next,
    back,
    maxReachable,

    save,
    saveState,
    error,
    clearError: () => {
      setError(undefined);
      setSaveState("idle");
    },
    fieldErrors: error?.fieldErrors ?? {},

    dirty,
    setDirty,

    progressMarker: legacyStep(index),
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
