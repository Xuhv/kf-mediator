import { createSender, createNotifier } from "./core.ts"
import { replayable } from "./replayable.ts"
import { assert, assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts"

Deno.test({
  name: "sender",
  fn: async () => {
    const [sender, histories1, replay1] = replayable<string, number>(createSender("sender"))
    sender.subscribe(async p => {
      console.log("aud1", p, p.length, histories1)
      return p.length
    })

    assertEquals(await sender.publish("hello"), 5)
    assertEquals(await sender.publish("world!"), 6)
    assertEquals(histories1.length, 2)
    assertEquals(await replay1(1), 6)

    const unsub = sender.subscribe(async p => {
      console.log("aud2", p, p.length, histories1)
      return p.length
    })

    assertEquals(await replay1(1), 6)
    unsub()
    assertEquals(await replay1(1), undefined)
  }
})

Deno.test({
  name: "notifier",
  fn: async () => {
    const [notifier, histories1, replay1] = replayable<string>(createNotifier("notifier"))
    const stack: string[] = []
    const unsub1 = notifier.subscribe(async p => {
      stack.push(`aud1 ${p}`)
    })
    const unsub2 = notifier.subscribe(async p => {
      stack.push(`aud2 ${p}`)
    })
    await notifier.publish("hello")
    assert(["aud1 hello", "aud2 hello"].every(x => stack.includes(x)) && stack.length === 2)
    console.log(stack)
    unsub1()
    unsub2()
    notifier.publish("hello")
    assert(["aud1 hello", "aud2 hello"].every(x => stack.includes(x)) && stack.length === 2)
    console.log(stack)
  }
})
