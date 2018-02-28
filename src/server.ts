import * as Router from "koa-router"
import { Context } from "koa"
import { OperationDescription } from "./operation"

export function createServerRouter(prefix: string, impl: object): Router {
    if (!prefix.startsWith("/")) prefix = "/" + prefix
    if (prefix.endsWith("/")) prefix = prefix.substring(0, prefix.length - 1)

    const router = new Router({ prefix })

    getMethodNames(impl).forEach(operationName => {
        const operationDescription = new OperationDescription(operationName)

        const verb = operationDescription.getMethod().toLowerCase()

        router[verb](operationDescription.getUrl(), (ctx: Context) => {
            return invokeImpl(impl, operationName, operationDescription, ctx)
        })
    })

    return router
}

function getMethodNames(o: object): Set<string> {
    const deepProps = x => x && x !== Object.prototype && Object.getOwnPropertyNames(x).concat(deepProps(Object.getPrototypeOf(x)) || [])
    const deepFunctions = x => deepProps(x).filter(name => typeof x[name] === "function")
    const userFunctions = x => new Set<string>(deepFunctions(x).filter(name => name !== "constructor" && !~name.indexOf("__")))

    return userFunctions(o)
}

async function invokeImpl(impl: object, operationName: string, operationDescription: OperationDescription, ctx: Context) {
    const arg = operationDescription.getMethod() == "GET"
        ? {}
        : ctx.request['body']

    const response = await impl[operationName](arg)
    ctx.body = response
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
