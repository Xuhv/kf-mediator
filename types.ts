export type MaybePromise<T> = T | Promise<T>

export type Handler<Payload = any, Result = any> = (payload: Payload) => MaybePromise<Result>

export type Sender<P = any, R = any> = {
  subscribe: (handler: Handler<P, R>) => () => void
  publish: (payload: P) => MaybePromise<R> | void
}

export type Notifier<P = any> = { subscribe: (handler: Handler<P, void>) => () => void; publish: (payload: P) => MaybePromise<void> }
