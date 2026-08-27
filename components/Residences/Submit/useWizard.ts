import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getResidenceDraft, shapeForStep } from "@/api/Residences/getResidenceSubmittedData";
import { submitStep } from "@/api/SubmitResidence";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { STEP_LOADERS } from "./stepLoaders";

/**
 * The shared machinery behind the submission wizard.
 *
 * What made it feel slow was never one slow request. It was that each step
 * did the same work again from scratch:
 *
 *   - the draft was refetched on every step, under a react-query key that
 *     included the step number, so the cache could never hit — eleven full
 *     fetches of one object across the wizard, each blocking the screen;
 *   - seven steps saved with two serial round trips, the second only to
 *     advance a progress counter;
 *   - the address step made three;
 *   - and a tap on an option showed nothing at all until the network came
 *     back, so the host could not tell whether it had registered.
 *
 * The first three are gone — the draft is cached per residence and every step
 * saves in one request. This file covers the fourth, and prefetches the next
 * step's code while the host is still reading the current one.
 */

const STEP_COUNT = 14;

export function useProductId(): number | undefined {
  const { query } = useRouter();
  const raw = Number(query?.productId as string);
  return Number.isFinite(raw) && raw > 0 ? raw : undefined;
}

export function useStepNumber(): number {
  const { query } = useRouter();
  return Number(query?.step as string) || 0;
}

/**
 * The draft, in the shape the current step wants.
 *
 * Cached by residence, not by step, so moving between steps costs nothing.
 * `staleTime` is generous because the only thing that changes the draft is
 * this wizard, and it invalidates the entry itself after every save.
 */
export function useResidenceDraft(stepOverride?: number) {
  const productId = useProductId();
  const step = useStepNumber();
  const forStep = stepOverride ?? step;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["residenceDraft", productId],
    queryFn: () => getResidenceDraft(productId as number),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  /**
   * The first snapshot this step sees, held for as long as it is mounted.
   *
   * Every step seeds its form fields from this in an effect keyed on the
   * payload. A save invalidates the draft, so a background refetch lands
   * moments later with a new object identity — which would re-run those
   * effects and overwrite whatever the host had begun typing on the screen
   * they had just moved to. Freezing per mount keeps that from happening;
   * revisiting a step remounts it and picks up the current draft.
   */
  const [frozen, setFrozen] = useState<any>(undefined);
  useEffect(() => {
    if (data && frozen === undefined) setFrozen(data);
  }, [data, frozen]);

  const source = frozen ?? data;

  return {
    // Same envelope the steps already read, so nothing downstream had to change.
    data: source ? shapeForStep(source, forStep) : undefined,
    raw: source,
    isLoading: !!productId && isLoading,
    isError,
    // Steps that upload files (images, documents) re-read after the upload
    // rather than guessing what the server stored.
    refetch: async () => {
      const result = await refetch();
      // An explicit re-read is the caller saying "the server has something I
      // do not" — that one must not be frozen out.
      if (result.data) setFrozen(result.data);
      return result;
    },
  };
}

export function useInvalidateDraft() {
  const queryClient = useQueryClient();
  const productId = useProductId();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["residenceDraft", productId] }),
    [queryClient, productId]
  );
}

interface SaveArgs {
  /** The payload for this step, in the shape api/SubmitResidence expects. */
  data: Record<string, any>;
  /**
   * Which control the host touched, so exactly that one can show it is
   * working. A single page-level spinner cannot say "this tile", and a tile
   * that does not react to a tap gets tapped again.
   */
  key?: string | number;
  /** Where to go on success. Defaults to the next step. */
  next?: number;
}

/**
 * Saves a step and moves on.
 *
 * The navigation waits for the save rather than running ahead of it. Moving
 * first and apologising later would mean a host who lost a step's work finding
 * out about it two screens further on — and the first step cannot move at all
 * until the server has minted the residence id the rest of the wizard is keyed
 * by. What the wait costs is now one round trip, and it is visible while it
 * happens.
 */
export function useSaveStep(step: number) {
  const router = useRouter();
  const productId = useProductId();
  const invalidate = useInvalidateDraft();
  const [pendingKey, setPendingKey] = useState<string | number | null>(null);

  // A step's own request must not resolve into a screen the host has since
  // left — they can hit back while it is in flight.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: ({ data }: SaveArgs) => submitStep({ step, productId, data }),
    onSuccess: (result, variables) => {
      if (!alive.current) return;
      if (result?.status !== "success") {
        setPendingKey(null);
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: result?.err_msg || defaultError },
        ]);
        return;
      }

      void invalidate();
      const nextStep = variables.next ?? step + 1;
      const id = result?.params?.product_id ?? productId;

      if (nextStep > STEP_COUNT) {
        router.push("/residences/list");
        return;
      }
      router.push(`?step=${nextStep}&productId=${id}`);
    },
    onError: () => {
      if (!alive.current) return;
      setPendingKey(null);
      exception.message([{ type: EXCEPTIONTYPES.ERROR, title: defaultError }]);
    },
  });

  const save = useCallback(
    (args: SaveArgs) => {
      if (mutation.isLoading) return; // a second tap is the same tap
      setPendingKey(args.key ?? "submit");
      mutation.mutate(args);
    },
    [mutation]
  );

  return { save, pendingKey, isSaving: mutation.isLoading };
}

/**
 * Warms the next step's chunk while the host is still on this one.
 *
 * Every step is a dynamic import, so without this the code for step N+1 only
 * starts downloading once the save has already returned — a second wait
 * stacked on the one the host just sat through. The wizard is a single route
 * with a `?step=` parameter, so `router.prefetch` has nothing to do here;
 * calling the import is what starts the chunk.
 *
 * Delayed a moment so it never competes with the current step's own work.
 */
export function usePrefetchNextStep(step: number) {
  useEffect(() => {
    const next = STEP_LOADERS[step + 1];
    if (!next) return;
    const timer = setTimeout(() => {
      void next().catch(() => {
        /* it will simply load on demand instead */
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [step]);
}
