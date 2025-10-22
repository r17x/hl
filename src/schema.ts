import { Schema } from "effect";

export const ApiInfo = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  runtime: Schema.String,
})

export const ErrorResponse = Schema.Struct({
  error: Schema.String
})

export class ResponseError extends Schema.TaggedError<ResponseError>()("ResponseError", {
  message: Schema.String
}) { }

