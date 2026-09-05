import dynamic from "next/dynamic";
import { StepSkeleton } from "./ui";

/**
 * One list, three uses.
 *
 * `dynamic()` is built from it, the wizard's prefetcher walks it, and the edit
 * hub renders one entry at a time — so a step cannot be registered for the
 * wizard and forgotten by the editor. Order matches `STEPS` in steps.ts.
 */
export const STEP_LOADERS = [
  () => import("./steps/Details"),
  () => import("./steps/Specs"),
  () => import("./steps/Address"),
  () => import("./steps/Capacity"),
  () => import("./steps/Amenities"),
  () => import("./steps/Pricing"),
  () => import("./steps/Images"),
  () => import("./steps/Documents"),
  () => import("./steps/Rules"),
  () => import("./steps/Review"),
];

export const STEP_COMPONENTS = STEP_LOADERS.map((load) =>
  dynamic(load, { ssr: false, loading: () => <StepSkeleton /> })
);
