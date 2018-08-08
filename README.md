# REST RPC for TypeScript

This library allows you to define your RESTful API in a TypeScript interface. 
That interface definition could be share between your backend and frontend code bases.
From that interface library can generate client and server stubs.

Uses `Koa.JS` for server stubs and `Fetch` to make client requests.

## Example

### Installation

```
yarn add typescript-rest-rpc
```

### Code
shared.ts:
```
export interface Backend {
    login({ username, password }): Promise<{ token: string }>
}

```

server.ts:
```
import { createServerRouter } from "typescript-rest-rpc/lib/server"

class BackendImpl implements Backend {
    async login({ username, password }): Promise<{ token: string }> {
        if (username == "admin" && password == "123456")
            return { token: "ok" }

        throw new BadRequest("Invalid login or password")
    }
}

const backendRouter = createServerRouter("/api", new BackendImpl())
app.use(backendRouter.routes())
```

client.ts:

```
import { createClient } from "typescript-rest-rpc/lib/client"

const client: Backend = createClient("http://localhost:9090/api")
console.log(await client.login({ username: "admin", password: "123456" }))
```

With this code you can even Ctrl-Click from your client code to your backend 
implementation to quick find how API is implemented! 

## Features
- Generating client and server RPC proxies based on zero-config TS interface.
- File upload support via multipart encoding (uses `koa-multer` under the hood).
- Binary data download.
- JSON bodies auto-parsing with Date revival. 
- Supported client envs: Node.JS (with `isomorphic-fetch`), browser, react-native(see notes).
 
## Implementation flaws
- untyped File in Multipart definition
- untyped File in binary download
- ctx parameter is untyped and should be defined in the base interface

## Notes on the implementation

### React-Native clients

For generating clients ES6 Proxy is used. However, React-Native doesn't support ES6 proxy 
on some devices, see [this RN Issue](https://github.com/facebook/react-native/issues/11232#issuecomment-264100958]).
And no polyfills could exist that will handle dynamic properties. So for React Native you 
should explicitly list your interface operations:
```
export let backend: Backend = createClient(url, {
    [ "login", "resetPassword", etc ]
)
``` 
