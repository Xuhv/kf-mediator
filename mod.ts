/**
 * A pub/sub library with simple api. Support unicast/multicast and async.
 * 
 * @example createSender
 * ```ts
 * const exampleSender = createSender<string, number>("example")
 *
 * const unsub = exampleSender.subscribe(async p => {
 *   return p.length
 * })
 *
 * const result = await exampleSender.publish("hello")
 * console.log(result) // 5
 *
 * unsub()
 * console.log(exampleSender.publish("hello")) // undefined
 * ```
 * 
 * @example createNotifier, replayable, mergeSubscriptions
 * ```ts
 * const [ notifier, _, replay ] = replayable(createNotifier<string>("example2"))
 * 
 * const container: string[] = []
 * 
 * const unsub = mergeSubscriptions(
 *   notifier.subscribe(async p => {
 *     container.push(`aud1 ${p}`)
 *   }),
 *   notifier.subscribe(async p => {
 *     container.push(`aud2 ${p}`)
 *   })
 * )
 * 
 * notifier.publish("hello")
 * 
 * replay(0); unsub(); replay(0)
 * 
 * console.log(container) // [ "aud1 hello", "aud2 hello", "aud1 hello", "aud2 hello" ]
 * ```
 * @module
 */

export * from "./core.ts"
export * from "./replayable.ts"