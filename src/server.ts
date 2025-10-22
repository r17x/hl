import { HttpApiBuilder } from "@effect/platform";
import { HttpApiDecodeError } from "@effect/platform/HttpApiError";
import * as Bun from 'bun';
import { Array, Effect, Layer, Stream } from "effect";
import path from 'path';
import { Api } from "./api";
import { render } from './app.server';
import { ResponseError } from "./schema";

const handleRoot =
  Effect.tryPromise(
    {
      try: render,
      catch: cause => new ResponseError({ message: String(cause) })
    }
  ).pipe(
    Effect.andThen(stream => Stream.fromReadableStream(
      () => stream,
      cause => new ResponseError({ message: String(cause) })
    )),
    Effect.andThen(
      stream => stream.pipe(Stream.decodeText("utf-8"), Stream.mkString)
    ),
    Effect.catchTags({
      ResponseError: (error) => Effect.fail({
        error: error.message
      })
    })
  )

const handleClientApp =
  Effect.tryPromise(
    {
      try: () => Bun.build({
        entrypoints: [path.resolve(import.meta.dir, './app.client.tsx')],
        minify: true,
        splitting: true,
        target: 'browser',
        jsx: {
          importSource: 'react',
          runtime: 'automatic',
        },
      }),
      catch: (_) => new HttpApiDecodeError({
        message: "bundling failed on the server", issues: []
      })
    }
  ).pipe(
    Effect.andThen(bundle => bundle.outputs),
    Effect.andThen(Array.make),
    Effect.andThen(Array.flatten),
    Effect.andThen(Array.head),
    Effect.andThen(
      bundle => Stream.fromReadableStream(
        () => bundle.stream(),
        () => new HttpApiDecodeError({ message: "Stream bundle failed", issues: [] })
      )),
    Effect.andThen(stream => stream.pipe(Stream.decodeText("utf-8"), Stream.mkString)),
    Effect.catchTags({
      NoSuchElementException: cause => new HttpApiDecodeError({ message: cause.message, issues: [] })
    }),
  )

const RootRoutes = HttpApiBuilder.group(Api, "root", (handlers) =>
  handlers
    .handle("info", () => Effect.succeed({
      name: "micromeet", version: "v0.0.0", runtime: "bun"
    }))
    .handle("root", () => handleRoot)
    .handle("client", () => handleClientApp)
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(RootRoutes))
