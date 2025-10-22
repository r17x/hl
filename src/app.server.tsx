"use server";
import * as React from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { App } from './app'
import { FromServer } from './actions'


const Page = () => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My app</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@webtui/css@0.0.5/dist/full.css" />
        <style dangerouslySetInnerHTML={{
          __html: `
          

          .row {
            flex: 2 0;
            flex-direction: row;
          }

          .left { flex: 3; }
          .right { flex: 2; }

          [role-~='doctor']{
            &::before { content: "[Doctor]: "}
          }

          [role-~='patient']{
            &::before { content: "[Patient]: "}
          }

          @layer components {
              [is-~='view'] {
                display: flex;
                gap: 50ch;
              }
          
              [is-~='view-content'] {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
          }

          @layer base {
              :root {
                  --font-size: 20px;
                  --font-family: 'JetBrainsMono', monospace;

                  --foreground0: #fff;
                  --foreground1: #ddd;
                  --foreground2: #bbb;

                  --background0: #000;
                  --background1: #444;
                  --background2: #888;
                  --background3: #999;

              }
          }`
        }} />


      </head>
      <body>
        <div id="root">
          <App />
          <FromServer />
        </div>
      </body>
    </html>

  )
}

export const render = (a: AbortSignal) => renderToReadableStream(
  <Page />,
  {
    signal: a,
    bootstrapScripts: ['/client'],
  }
)


