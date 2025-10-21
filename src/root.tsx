import * as React from 'react'
// import { getServerCounter, updateServerCounter } from './action.tsx'
import { Chat } from './client.tsx'
// import type { Message, Role } from './schema.ts'

export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Micromeet AI</title>
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
        <App />
      </body>
    </html>
  )
}

function App() {
  return (
    <div id="root">
      <h1> Health Application with AI </h1>
      <br />
      <hr />
      <br />
      <ul className="read-the-docs">
        <li>
          Write chat as Patient and enter ↩
        </li>
        <li>
          Write chat as Doctor and enter ↩
        </li>
        <li>
          Click <code>Generate Medical Record</code>
        </li>
      </ul>
      <br />
      <hr />
      <br />
      <div className="card">
        <Chat />
      </div>
    </div>
  )
}
