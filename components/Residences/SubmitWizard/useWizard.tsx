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

/**
 * Same forms, two jobs.
 *
 * «create» is the wizard: a line of steps with a gate at each one, walked once.
 * «edit» is the hub: the same ten forms, reachable in any order, each saved on
 * its own and returning to the list it was opened from. The steps themselves
 * cannot tell the difference — everything that differs (what «ادامه» means,
 * whether a step can be skipped to, what the URL carries) lives here.
 */
export type WizardMode = "create" | "edit";

interface WizardValue {
  mode: WizardMode;
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
  /** Edit mode only: which section is open, or null on the hub itself. */
  openSection: string | null;
  /** Edit mode only: close the open section and return to the hub. */
  backToHub: () => void;

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
  /** Fire-and-continue: the step advances now, the write follows. */
  commit: <T>(run: (residenceId: number) => Promise<Result<T>>, options?: SaveOptions) => void;
  /** True while a background write has failed and not yet been retried. */
  hasFailedSave: boolean;
  retryFailed: () => void;
  saveState: SaveState;
  error?: Err;
  clearError: () => void;
  /** Field name to messages, straight from the server's last rejection. */
  fieldErrors: Record<string, string[]>;

  dirty: boolean;
  setDirty: (value: boolean) => void;
  /** True while there is work the server has not acknowledged. */
  atRisk: boolean;
  /**
   * Leave the wizard on purpose, having already asked.
   *
   * The route guard exists to catch someone leaving by accident; a host who
   * pressed «خروج» and confirmed is not that person, and asking them a second
   * time in a browser dialog reads as the app not having heard them.
   */
  exit: () => void;

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

export function WizardProvider({
  children,
  mode = "create",
  residenceId: residenceIdProp,
}: {
  children: React.ReactNode;
  mode?: WizardMode;
  /** Edit mode addresses the listing by route param, not `?productId`. */
  residenceId?: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const residenceId = useMemo(() => {
    if (residenceIdProp) return residenceIdProp;
    const raw = Number(router.query?.productId);
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  }, [residenceIdProp, router.query?.productId]);

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

  /** Nothing is out of reach on a listing that already exists — the gates
   * exist to stop someone skipping ahead while building, not to stop an owner
   * from correcting the address of a live listing. */
  const maxReachable = mode === "edit" ? TOTAL_STEPS - 1 : draft ? Math.max(resume, 0) : 0;

  const openSection = useMemo(() => {
    if (mode !== "edit") return null;
    const raw = router.query?.section;
    const key = typeof raw === "string" ? raw : null;
    return key && STEPS.some((s) => s.key === key) ? key : null;
  }, [mode, router.query?.section]);

  const index = useMemo(() => {
    if (mode === "edit") {
      const found = STEPS.findIndex((s) => s.key === openSection);
      return found === -1 ? 0 : found;
    }
    if (!Number.isFinite(requested)) return resume;
    if (requested < 0 || requested >= TOTAL_STEPS) return resume;
    // Free movement backwards over finished work; forward only to the gap.
    return Math.min(requested, Math.max(maxReachable, 0));
  }, [mode, openSection, requested, resume, maxReachable]);

  const step = STEPS[index] ?? STEPS[0];

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(target, TOTAL_STEPS - 1));
      const query: Record<string, string> =
        mode === "edit"
          ? { ...(router.query as Record<string, string>), section: STEPS[clamped].key }
          : { step: String(clamped) };
      if (mode !== "edit" && residenceId) query.productId = String(residenceId);
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [mode, residenceId, router]
  );

  const backToHub = useCallback(() => {
    const query = { ...(router.query as Record<string, string>) };
    delete query.section;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  // Saving a section in edit mode is the end of that errand, not a step toward
  // the next one — so «ادامه» lands back on the hub the host came from.
  const next = useCallback(() => {
    if (mode === "edit") return backToHub();
    goTo(index + 1);
  }, [mode, backToHub, goTo, index]);

  const back = useCallback(() => {
    if (mode === "edit") return backToHub();
    goTo(index - 1);
  }, [mode, backToHub, goTo, index]);

  // -------------------------------------------------------------- saving ---

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<Err | undefined>();
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();

  /**
   * A save that went out after the host had already moved on, and failed.
   *
   * Held with the call that produced it so it can simply be tried again,
   * rather than asking the host to walk back and retype a screen they have
   * left. Mirrored into a ref because the retry handler is memoised.
   */
  const [failure, setFailure] = useState<
    { run: (residenceId: number) => Promise<Result<unknown>>; options?: SaveOptions } | undefined
  >();
  const failureRef = useRef(failure);
  failureRef.current = failure;

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

  const runSave = useCallback(
    async <T,>(
      run: (residenceId: number) => Promise<Result<T>>,
      options?: SaveOptions
    ): Promise<boolean> => {
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

  /**
   * Save, and wait for it.
   *
   * For the two writes where waiting is the point: creating the listing, which
   * mints the id the rest of the wizard is keyed by, and the final submit.
   */
  const save = useCallback(
    async <T,>(
      run: (residenceId: number) => Promise<Result<T>>,
      options?: SaveOptions
    ): Promise<boolean> => {
      // A second press while the first is in flight is the same press.
      if (mutation.isLoading) return false;
      return runSave(run, options);
    },
    [mutation.isLoading, runSave]
  );

  /**
   * Save, and do not wait for it.
   *
   * The wizard used to hold the host on the current screen until the server
   * answered — a round trip, and two on the steps that re-read afterwards.
   * That is a second or more of nothing happening after every «ادامه», on
   * every one of ten steps, and it is the single thing that made the flow feel
   * slow. Nothing about the next screen depends on the answer: the steps write
   * to different fields, and each seeds itself from the draft already in the
   * cache.
   *
   * So the navigation happens now and the request goes out behind it. What
   * that costs is that a failure arrives after the host has moved on — so it
   * is not swallowed: `failure` holds the message and the exact call to try
   * again, the banner follows them across steps, and the final submit refuses
   * to run while one is outstanding. A save that silently did not happen is
   * the only outcome worse than a slow one.
   */
  const commit = useCallback(
    <T,>(run: (residenceId: number) => Promise<Result<T>>, options?: SaveOptions) => {
      setFailure(undefined);
      void runSave(run, options).then((ok) => {
        if (!ok) setFailure({ run: run as (id: number) => Promise<Result<unknown>>, options });
      });
    },
    [runSave]
  );

  const retryFailed = useCallback(() => {
    if (!failureRef.current) return;
    const { run, options } = failureRef.current;
    setFailure(undefined);
    void runSave(run, options).then((ok) => {
      if (!ok) setFailure({ run, options });
    });
  }, [runSave]);

  // --------------------------------------------------- unsaved-work guard ---

  const [dirty, setDirty] = useState(false);

  /**
   * Set when the host leaves through the wizard's own exit, which has already
   * asked. A ref rather than state: the guard has to see the new value inside
   * the same tick as the `router.push` that follows it.
   */
  const leaving = useRef(false);

  const exit = useCallback(() => {
    leaving.current = true;
    setDirty(false);
    void router.push("/residences/list");
  }, [router]);

  /**
   * Closing the tab on top of work the server has not got.
   *
   * "Dirty" is no longer the whole story: a step marks itself clean the moment
   * it hands its write to `commit`, and that write is still in the air. A save
   * in flight, or one that failed and has not been retried, is exactly as
   * unsaved as an untouched form.
   */
  const atRisk = dirty || mutation.isLoading || !!failure;

  useEffect(() => {
    if (!atRisk) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (leaving.current) return;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [atRisk]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (url: string) => {
      if (leaving.current) return;
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
    mode,
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
    openSection,
    backToHub,

    save,
    commit,
    hasFailedSave: !!failure,
    retryFailed,
    saveState,
    error,
    clearError: () => {
      setError(undefined);
      setSaveState("idle");
    },
    fieldErrors: error?.fieldErrors ?? {},

    dirty,
    setDirty,
    atRisk,
    exit,

    progressMarker: legacyStep(index),
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
