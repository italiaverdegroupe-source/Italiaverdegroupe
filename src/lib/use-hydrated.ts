'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * False while the server-rendered HTML is what is on screen, true once the
 * browser has taken over.
 *
 * Two things need this: something that can only be decided in the browser
 * (reading localStorage, portalling to document.body), and telling "we have
 * not looked yet" apart from "there is nothing there".
 *
 * Written with useSyncExternalStore rather than as a flag set in an effect.
 * `useEffect(() => setMounted(true), [])` is the familiar version and it
 * renders twice on every mount of every component that uses it; this returns
 * the right answer on the first client render instead.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
