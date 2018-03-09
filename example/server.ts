import * as Koa from "koa"
import * as koaBody from "koa-body"

import { Backend } from "./shared"
import { BadRequest, createServerRouter, HttpError } from "../src/server"

class BackendImpl implements Backend {
    async login({ username, password }): Promise<{ token: string }> {
        if (username == "admin" && password == "123456")
            return { token: "ok" }

        throw new BadRequest("Invalid login or password")
    }
}

const app = new Koa()
app.use(koaBody({ multipart: true }))

// app.use(requestLogger)
// ... other middle wares

// exception handling
app.use(async (ctx, next) => {
    try {
        return await next()
    } catch (e) {
        if (e instanceof HttpError) {
            ctx.status = e.code
            ctx.body = e.message
        } else {
            const msg = e instanceof Error ? e.message : "" + e

            ctx.status = 500
            ctx.body = msg

            console.error(`While ${ctx.request.path}:`, e)
        }
    }
})

const backendRouter = createServerRouter("/api", new BackendImpl())

app.use(backendRouter.routes())
app.use(backendRouter.allowedMethods())

app.listen(9090)
console.log(`Server started on port 9090`)