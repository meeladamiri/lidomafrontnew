import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * A step's form.
 *
 * Small on purpose. Formik is in the project and every old step used it, but
 * what a step here needs is four things — values, per-field errors, "has this
 * field been touched", and a way to say whether it is safe to move on — and
 * `enableReinitialize`, the one Formik feature those steps leaned on, is what
 * made the old wizard overwrite a host's typing when a background refetch
 * landed.
 *
 * The seeding rule is the important part: values are seeded from the draft
 * **once**, when the draft first arrives. After that the host owns the screen.
 */

export type Validator<V> = (values: V) => Partial<Record<keyof V, string>>;

interface Options<V> {
  /** Seeded once, as soon as it is not undefined. */
  initial: V | undefined;
  validate?: Validator<V>;
  /**
   * Namespace for the crash-recovery copy in localStorage. Omit to keep the
   * step out of local storage entirely — right for anything sensitive.
   */
  rescueKey?: string;
}

export interface StepForm<V> {
  values: V;
  errors: Partial<Record<keyof V, string>>;
  /** Errors for fields the host has actually visited, plus everything after a submit attempt. */
  visibleErrors: Partial<Record<keyof V, string>>;
  isValid: boolean;
  ready: boolean;
  setField: <K extends keyof V>(key: K, value: V[K]) => void;
  setValues: (updater: (previous: V) => V) => void;
  touch: (key: keyof V) => void;
  /** Marks everything touched and reports whether the step passes. */
  submit: () => boolean;
  /** True once the host has changed anything since the last save. */
  dirty: boolean;
  markSaved: () => void;
  /** Server-side field errors, merged in under the same names. */
  setServerErrors: (errors: Record<string, string[]> | undefined) => void;
  /** A rescued copy was found and restored after a failed save. */
  rescued: boolean;
  dismissRescue: () => void;
}

const rescueStore = {
  read(key: string): unknown {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  },
  write(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode, quota, disabled storage — losing the copy is survivable */
    }
  },
  clear(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* as above */
    }
  },
};

export function useStepForm<V extends Record<string, any>>({
  initial,
  validate,
  rescueKey,
}: Options<V>): StepForm<V> {
  const [values, setValuesState] = useState<V>((initial ?? {}) as V);
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrorsState] = useState<Partial<Record<keyof V, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [rescued, setRescued] = useState(false);
  const seeded = useRef(false);
  /**
   * Readiness is state, not the ref above, and that distinction is the whole
   * bug this comment exists for.
   *
   * It used to be reported straight off `seeded.current`. The effect set the
   * ref and then called `setValuesState(initial)` to trigger the re-render
   * that would show it — except when the draft was already in the query cache
   * at mount, in which case `useState` had *already* initialised `values` to
   * that exact object. Setting state to the value it already holds is a
   * no-op: React bails out, no re-render happens, and a ref change cannot
   * schedule one. The step sat on its loading skeleton forever.
   *
   * It only reproduced when the draft arrived before the step mounted, which
   * is what happens on every step after the first — so the wizard worked when
   * walked slowly and hung when walked normally.
   *
   * `false` to `true` always re-renders.
   */
  const [ready, setReady] = useState(false);

  // ------------------------------------------------------------- seeding ---

  useEffect(() => {
    if (seeded.current || initial === undefined) return;
    seeded.current = true;

    /**
     * A copy kept when a save failed outlives the reload the failure often
     * causes. It is only ever preferred over the draft because it is, by
     * definition, work the server never received.
     */
    if (rescueKey) {
      const saved = rescueStore.read(rescueKey);
      if (saved && typeof saved === "object") {
        setValuesState({ ...initial, ...(saved as V) });
        setRescued(true);
        setDirty(true);
        setReady(true);
        return;
      }
    }
    setValuesState(initial);
    setReady(true);
  }, [initial, rescueKey]);

  // ---------------------------------------------------------- validation ---

  const errors = useMemo<Partial<Record<keyof V, string>>>(() => {
    const local = validate ? validate(values) : {};
    return { ...local, ...serverErrors };
  }, [validate, values, serverErrors]);

  const isValid = Object.values(errors).every((message) => !message);

  /**
   * What is actually shown.
   *
   * Errors appear when a field is left, or once the host has tried to move on.
   * Marking an untouched empty field as wrong the moment the screen opens is
   * how a form tells someone off for not having started yet.
   */
  const visibleErrors = useMemo(() => {
    const out: Partial<Record<keyof V, string>> = {};
    (Object.keys(errors) as (keyof V)[]).forEach((key) => {
      if (attempted || touched[key]) out[key] = errors[key];
    });
    return out;
  }, [errors, touched, attempted]);

  // ------------------------------------------------------------- writing ---

  const setField = useCallback<StepForm<V>["setField"]>((key, value) => {
    setValuesState((previous) => ({ ...previous, [key]: value }));
    setDirty(true);
    // A field the host is fixing should stop being red as they fix it.
    setServerErrorsState((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const setValues = useCallback<StepForm<V>["setValues"]>((updater) => {
    setValuesState((previous) => updater(previous));
    setDirty(true);
  }, []);

  const touch = useCallback<StepForm<V>["touch"]>((key) => {
    setTouched((previous) => ({ ...previous, [key]: true }));
  }, []);

  /**
   * Marks everything touched and reports whether the step passes.
   *
   * Server errors are cleared first, and deliberately do not gate this. They
   * describe the *previous* attempt, and the step cannot always show them: a
   * rejection naming a field this screen does not render — `latitude` on a
   * step whose coordinate boxes were removed, or `invoiceAddress`, which is
   * derived rather than typed — has nowhere to appear. Keeping it would block
   * «ادامه» permanently with nothing on screen explaining why, which is
   * exactly the dead end this wizard was rebuilt to remove.
   *
   * So a retry is always allowed to reach the server. If the input is still
   * wrong, the server says so again and the answer is shown — next to the
   * field when it has one, in the step's error banner when it does not.
   */
  const submit = useCallback(() => {
    setAttempted(true);
    setServerErrorsState({});
    const found = validate ? validate(values) : {};
    return Object.values(found).every((message) => !message);
  }, [validate, values]);

  const markSaved = useCallback(() => {
    setDirty(false);
    setAttempted(false);
    if (rescueKey) rescueStore.clear(rescueKey);
    setRescued(false);
  }, [rescueKey]);

  const setServerErrors = useCallback<StepForm<V>["setServerErrors"]>(
    (incoming) => {
      if (!incoming) {
        setServerErrorsState({});
        return;
      }
      const mapped: Partial<Record<keyof V, string>> = {};
      Object.entries(incoming).forEach(([field, messages]) => {
        mapped[field as keyof V] = messages?.[0];
      });
      setServerErrorsState(mapped);
      setAttempted(true);
      // Whatever the server refused is work it does not have. Keep a copy.
      if (rescueKey) rescueStore.write(rescueKey, values);
    },
    [rescueKey, values]
  );

  const dismissRescue = useCallback(() => {
    if (rescueKey) rescueStore.clear(rescueKey);
    setRescued(false);
  }, [rescueKey]);

  return {
    values,
    errors,
    visibleErrors,
    isValid,
    ready,
    setField,
    setValues,
    touch,
    submit,
    dirty,
    markSaved,
    setServerErrors,
    rescued,
    dismissRescue,
  };
}

/**
 * Saves shortly after typing stops.
 *
 * The delay is long enough that a sentence is not eight requests and short
 * enough that stepping away for a moment does not lose the paragraph. It fires
 * only while `enabled` — a step with an invalid field should not keep
 * hammering an endpoint that will keep rejecting it.
 */
export function useDebouncedAutosave(
  run: () => void,
  { enabled, delay = 1200, deps }: { enabled: boolean; delay?: number; deps: unknown[] }
) {
  const latest = useRef(run);
  latest.current = run;

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => latest.current(), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, delay, ...deps]);
}
