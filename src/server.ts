import * as Router from "koa-router"
import { Context } from "koa"

import { OperationDescription } from "./operation"
import { Multipart } from "./multipart"

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
    let arg = operationDescription.getMethod() == "GET"
        ? {}
        : ctx.request["body"]

    if (ctx.request.is("multipart")) {
        arg = new Multipart(arg.files, arg.fields)
    }

    const response = await impl[operationName](arg, ctx)
    ctx.body = response
}