/**
 * It wraps a `sender` or `notifier` and gives a `replay` function and a `histories` array. No any hack.
 * @module
 */

import type { Sender, Notifier, MaybePromise } from "./types.ts"

type Replayable<T extends Sender | Notifier> = T extends Sender<infer P, infer R>
  ? [mediator: T, histories: P[], replay: (idx: number) => MaybePromise<R>]
  : T extends Notifier<infer P>
    ? [mediator: T, histories: P[], replay: (idx: number) => MaybePromise<void>]
    : never

/**
 * It use `Proxy` api to intercept `sender.publish` and `notifier.publish`,
 * so you should pay more attention to the compatibility.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#browser_compatibility
 */
export function replayable<P>(sender: Notifier<P>): Replayable<Notifier<P>>
export function replayable<P, R>(sender: Sender<P, R>): Replayable<Sender<P, R>>
export function replayable<P, R>(senderOrNotifier: Sender<P, R> | Notifier<P>): any {
  const stack: any[] = []
  const proxy = new Proxy(senderOrNotifier, {
    get(target, prop, receiver) {
      if (prop === "publish") {
        return async (payload: any) => {
          stack.push(payload)
          return target.publish(payload)
        }
      }
      return Reflect.get(target, prop, receiver)
    }
  })

  const replay = (idx: number) => {
    if (idx >= stack.length) throw new Error("replay out of range")
    return proxy.publish(stack[idx])
  }

  return [proxy, stack, replay]
}
