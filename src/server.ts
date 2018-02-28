import * as Router from "koa-router"
import { Context } from "koa"
import { OperationDescription } from "./operation"

export function createServerRouter(prefix: string, impl: object): Router {
    const router = new Router({ prefix })

    Object.keys(impl).forEach(operationName => {
        const operationDescription = new OperationDescription(operationName)

        const verb = operationDescription.getMethod().toLowerCase()

        router[verb](operationDescription.getUrl(), (ctx: Context) => {
            return invokeImpl(impl, operationName, ctx)
        })
    })

    return router
}

function invokeImpl(impl: object, operationName: string, ctx: Context) {
    console.log("Invoking ", operationName)
}

export class HttpError extends Error {
    code: number

    constructor(code, message = null) {
        super(message)

        this.code = code
    }
}

export class NotFound extends HttpError {
    constructor() {
        super(404)
    }
}

export class BadRequest extends HttpError {
    constructor(message = null) {
        super(400, message)
    }
}
