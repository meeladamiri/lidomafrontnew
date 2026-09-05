import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` where it can run, `useEffect` where it cannot.
 *
 * React warns if `useLayoutEffect` is used during a server render, so the
 * usual workaround is to pick between the two. Doing that with a `const` in
 * the same module that uses it trips Fast Refresh in dev — the alias lands in
 * a temporal dead zone and the component throws «useIsomorphicLayoutEffect is
 * not defined» on hydrate — so it lives in its own module, which also means
 * the copy that was sitting in the wizard's Shell is no longer a second
 * definition of the same thing.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default useIsomorphicLayoutEffect;
