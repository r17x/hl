import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  // HttpApiMiddleware,
  // HttpApiSchema,
  // HttpApiSecurity,
} from "@effect/platform";
import { ApiInfo, ErrorResponse } from "./schema";


const Root = HttpApiGroup.make("root")
  .add(
    HttpApiEndpoint.get('root')`/`.addSuccess(HttpApiSchema.Text({ contentType: "text/html" })).addError(ErrorResponse)
  )
  .add(
    HttpApiEndpoint.get('info')`/info`.addSuccess(ApiInfo),
  )
  .add(
    HttpApiEndpoint.get('client')`/client`.addSuccess(HttpApiSchema.Text({ contentType: "text/javascript" }))
  )


export class Api extends HttpApi.make('Api')
  .add(Root) { }
