/**
 * One list of step loaders, used twice.
 *
 * `dynamic()` builds the components from these, and the wizard calls the next
 * one directly to warm its chunk while the host is still filling in the
 * current step. The whole wizard is a single route with a `?step=` parameter,
 * so `router.prefetch` has nothing to fetch — the code that has to arrive
 * early is a dynamic import's chunk, and the only way to start it early is to
 * call the import.
 */
export const STEP_LOADERS = [
  () => import("./Steps/Step_0"),
  () => import("./Steps/Step_1"),
  () => import("./Steps/Step_2"),
  () => import("./Steps/Step_3"),
  () => import("./Steps/Step_4"),
  () => import("./Steps/Step_5"),
  () => import("./Steps/Step_6"),
  () => import("./Steps/Step_7"),
  () => import("./Steps/Step_8"),
  () => import("./Steps/Step_9"),
  () => import("./Steps/Step_10"),
  () => import("./Steps/Step_11"),
  () => import("./Steps/Step_12"),
  () => import("./Steps/Step_13"),
  () => import("./Steps/Step_14"),
];

export const STEP_COUNT = STEP_LOADERS.length - 1;
