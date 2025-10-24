from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import subprocess
import os
from pathlib import Path
from typing import AsyncIterator

app = FastAPI()

# Directory setup
CURRENT_DIR = Path(__file__).parent


async def render_app() -> AsyncIterator[bytes]:
    """
    Server-side render the React app and stream the HTML.
    This should call your SSR rendering logic.
    """
    try:
        # i need this, for render react in server (depends with bun)
        process = subprocess.Popen(
            ['bun', '-e' "require('./src/app.server.tsx').render().then(a=>a.text()).then(console.log)"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=CURRENT_DIR
        )
        
        if process.stdout:
            for line in iter(process.stdout.readline, b''):
                if line:
                    yield line
        
        process.wait()
        
        if process.returncode != 0:
            error = process.stderr.read().decode() if process.stderr else "Unknown error"
            raise Exception(f"Rendering failed: {error}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rendering error: {str(e)}")


async def bundle_client_app() -> AsyncIterator[bytes]:
    """
    Bundle the client-side React app using a bundler (e.g., esbuild, webpack).
    Returns the bundled JavaScript as a stream.
    """
    try:
        # Using esbuild as an alternative to Bun.build
        # Install: npm install -g esbuild
        entry_point = CURRENT_DIR / 'src/app.client.tsx'
        out_dir = '/tmp/app_client'
        out_file = Path(out_dir) / 'app.client.js'

        if out_file.exists():
            process = subprocess.Popen(
                [
                    'bun', 'build',
                    str(entry_point),
                    '--minify',
                    '--target=browser',
                    '--jsx=automatic',
                    '--jsx-import-source=react',
                    '--outdir='+out_dir
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=CURRENT_DIR
            )

            # wait bundle process
            stdout, stderr = process.communicate()
        
            if process.returncode != 0:
                error = process.stderr.read().decode() if process.stderr else "Unknown error"
                raise Exception(f"Bundling failed: {error}")
        chunk_size = 8192
        with open(out_file, 'rb') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk 
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Bundled file not found at {out_file}") 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bundling error: {str(e)}")


@app.get("/info")
async def info():
    """
    Returns basic information about the application.
    same with implemetation at ./src/server.ts
    """
    return JSONResponse({
        "name": "micromeet",
        "version": "v0.0.0",
        "runtime": "python"
    })


@app.get("/")
async def root():
    """
    Server-side renders the React application and returns HTML.
    """
    return StreamingResponse(
        render_app(),
        media_type="text/html",
        headers={
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked"
        }
    )


@app.get("/client")
async def client():
    """
    Bundles and returns the client-side JavaScript application.
    """
    return StreamingResponse(
        bundle_client_app(),
        media_type="application/javascript",
        headers={
            "Cache-Control": "public, max-age=31536000",
            "Transfer-Encoding": "chunked"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
