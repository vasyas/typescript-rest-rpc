// import { createServerRoute } from "../src"
import { Backend } from "./shared"

import * as Koa from "koa"
import { createServerRouter, HttpError } from "../src"

class BackendImpl implements Backend {
    async login({ username, password }): Promise<{ token: string }> {
        if (username == "admin" && password == "123456")
            return { token: "ok" }

        throw new HttpError(400)
    }
}

const app = new Koa()

const backendRouter = createServerRouter("/api", new BackendImpl())

app.use(backendRouter.routes())
app.use(backendRouter.allowedMethods())

app.listen(9090)
console.log("Server started")
