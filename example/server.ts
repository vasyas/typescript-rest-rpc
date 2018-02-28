import * as Koa from "koa"
import * as koaBody from "koa-body"

import { Backend } from "./shared"
import { createServerRouter, HttpError } from "../src"

class BackendImpl implements Backend {
    async login({ username, password }): Promise<{ token: string }> {
        if (username == "admin" && password == "123456")
            return { token: "ok" }

        throw new HttpError(400)
    }
}

const app = new Koa()
app.use(koaBody({ multipart: true }))

const backendRouter = createServerRouter("/api", new BackendImpl())

app.use(backendRouter.routes())
app.use(backendRouter.allowedMethods())

app.listen(9090)
console.log(`Server started on port 9090`)
