import { useEffect, useRef } from "react";

/**
 * The live channel.
 *
 * `EventSource` rather than a socket library: it is built into the browser, so
 * it costs nothing in the bundle, reconnects on its own, and needs no upgrade
 * handshake to survive the proxy in front of the API. Sending a message is an
 * ordinary POST — only delivery has to be pushed.
 *
 * Authentication is by cookie. EventSource cannot set an Authorization header,
 * which is the whole reason the backend accepts the session cookie as well.
 * The request is same-origin (`/api/*` is rewritten to the backend by Next),
 * so the cookie travels without any extra configuration.
 *
 * If the stream cannot be established — an old browser, a proxy that buffers
 * it into uselessness — `onFallback` fires and the caller polls instead. A
 * chat that silently stops updating is worse than one that updates slowly.
 */

export type ChatStreamEvent =
  | { type: "message"; data: any }
  | { type: "read"; data: any }
  | { type: "typing"; data: any }
  | { type: "message-deleted"; data: any };

const EVENTS: ChatStreamEvent["type"][] = ["message", "read", "typing", "message-deleted"];

/** Two failed connections in a row is a broken transport, not a blip. */
const FAILURES_BEFORE_FALLBACK = 2;

export function useChatStream(
  enabled: boolean,
  onEvent: (event: ChatStreamEvent) => void,
  onFallback?: (isFallingBack: boolean) => void
) {
  // Kept in a ref so a re-render with a new closure does not tear the
  // connection down and open another.
  const handler = useRef(onEvent);
  handler.current = onEvent;

  const fallbackHandler = useRef(onFallback);
  fallbackHandler.current = onFallback;

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof EventSource === "undefined") {
      fallbackHandler.current?.(true);
      return;
    }

    let source: EventSource | null = null;
    let failures = 0;
    let closed = false;

    const open = () => {
      if (closed) return;
      source = new EventSource("/api/conversations/stream", { withCredentials: true });

      source.onopen = () => {
        failures = 0;
        fallbackHandler.current?.(false);
      };

      EVENTS.forEach((name) => {
        source?.addEventListener(name, (event) => {
          try {
            handler.current({ type: name, data: JSON.parse((event as MessageEvent).data) });
          } catch {
            /* a malformed frame is not worth breaking the stream over */
          }
        });
      });

      source.onerror = () => {
        failures += 1;
        if (failures >= FAILURES_BEFORE_FALLBACK) {
          // EventSource retries forever on its own. Left alone against a proxy
          // that will never let it through, that is an invisible reconnect
          // loop and a chat that never updates.
          fallbackHandler.current?.(true);
        }
      };
    };

    open();

    return () => {
      closed = true;
      source?.close();
    };
  }, [enabled]);
}
