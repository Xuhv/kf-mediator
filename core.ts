/**
 * The core logic of this library. It maintains a simple registry of handlers.
 * @module
 */

import type { Handler, Notifier, Sender } from "./types.ts"

/**
 * A constant is a natural singleton.
 */
const registry = new Map<string, Handler | Handler[]>()

/**
 * It is only internal because it does not check registry's value type.
 */
const subscribe = <Payload, Result>(cmd: string, handler: Handler<Payload, Result>, multicast = false) => {
  multicast ? registry.set(cmd, [...((registry.get(cmd) as Handler[]) || []), handler]) : registry.set(cmd, handler)
  return () => {
    multicast ? (registry.get(cmd) as Handler[]).splice((registry.get(cmd) as Handler[]).indexOf(handler), 1) : registry.delete(cmd)
  }
}

/**
 * Unicast
 * @param cmd the key to register and unregister the handler
 */
export function createSender<Payload, Result>(cmd: string): Sender<Payload, Result> {
  return {
    subscribe: (handler: Handler<Payload, Result>) => subscribe(cmd, handler, false),
    publish: (payload: Payload) => {
      return (registry.get(cmd) as Handler<Payload, Result>)?.(payload)
    }
  }
}

/**
 * Multicast
 * @param cmd the key to register and unregister the handler
 */
export function createNotifier<Payload>(cmd: string): Notifier<Payload> {
  return {
    subscribe: (handler: Handler<Payload, void>) => subscribe(cmd, handler, true),
    publish: async (payload: Payload) => {
      const results = (registry.get(cmd) as Handler<Payload, void>[] | undefined)?.map(h => h(payload))
      results && (await Promise.allSettled(results))
    }
  }
}

/**
 * return a function to unsubscribe all subscriptions
 */
export function mergeSubscriptions(...manyUnsub: (() => void)[]): () => void {
  return () => {
    for (const unsub of manyUnsub) unsub()
  }
}
