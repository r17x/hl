import { Command, Options } from '@effect/cli'
import { BunContext, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { Console, Effect, Layer, Data, Array } from 'effect'
import { ApiLive } from './server'
import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform'

import * as Bun from 'bun'
import path from 'path'

class BuildError extends Data.TaggedError("BuildError")<{ message: string }> { }

// $ program build
const commandBuild = Command.make("build", {},
  () =>
    Effect.tryPromise(
      {
        try: () => Bun.build({
          entrypoints: [path.resolve(import.meta.dir, 'app.client.tsx')],
          minify: true,
          jsx: {
            importSource: 'react',
            runtime: 'automatic',
          },
        }),
        catch: (cause) => new BuildError({ message: String(cause) })
      }
    ).pipe(
      Effect.andThen(a => a.outputs),
      Effect.andThen(Array.make),
      Effect.andThen(Array.flatten),
      Effect.andThen(Array.head),
    )
)

// $ program server 
const commandServer = Command.make(
  "server",
  {
    port: Options.integer("port").pipe(
      Options.withAlias('p'),
      Options.withDefault(8080),
      Options.withDescription("Port to run server")
    ),

    host: Options.text("host").pipe(
      Options.withAlias('h'),
      Options.withDefault('localhost'),
      Options.withDescription("Host to bind to the server")
    )
  },
  ({ port, host }) =>
    HttpApiBuilder.serve(HttpMiddleware.logger)
      .pipe(
        Layer.provide(ApiLive),
        Layer.provide(HttpApiBuilder.middlewareCors()),
        HttpServer.withLogAddress,
        Layer.provide(BunHttpServer.layer({ port, host })),
        Layer.launch,
      )
)

// $ program
const command = Command.make(
  "micromeet",
  {},
  () => Console.info("Hello world")
)
  .pipe(
    Command.withSubcommands([commandServer, commandBuild])
  )

const cli = Command.run(command, {
  name: "Micromeet App",
  version: "v0.0.0",
})

cli(process.argv).pipe(
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
