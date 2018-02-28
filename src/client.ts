import { OperationDescription } from "./operation"

export function createClient(targetUrl: string, options: ClientOptions = {}): any {
    if (targetUrl.endsWith("/"))
        targetUrl = targetUrl.substring(0, targetUrl.length - 1)

    return new Proxy({}, {
        get (target, operationName: string) {
            return restCall(targetUrl, operationName, options)
        }
    })
}

export interface ClientOptions {
    supplyHeaders?(): object
    onServerError?(error: ServerError): void
    onResponse?(response: Response): void
}

function restCall(targetUrl: string, operationName: string, options: ClientOptions) {
    return function(...args): Promise<any> {
        if (args.length > 1) {
            throw new Error(`Operation '${ operationName }', expecting 0 or 1 arguments, got ${ args.length }`)
        }

        const parsedOperation = new OperationDescription(operationName, args)

        const headers = options.supplyHeaders ? options.supplyHeaders() : {}

        return new Promise((resolve, reject) => {
            fetch(targetUrl + parsedOperation.getUrl(), {
                method: parsedOperation.getMethod(),
                body: parsedOperation.getBody(),
                headers: {
                    ...headers,
                    ...parsedOperation.getHeaders()
                },
                cache: "no-cache",
                credentials: "same-origin"
            })
                .then(response => confirmSuccessResponse(response, options))
                .then(response => parseResponse(response))
                .then(response => {
                    options.onResponse && options.onResponse(response)
                    return response;
                })
                .then(response => resolve(response))
                .catch(error => reject(error))
        })
    }
}

async function parseResponse(response) {
    if (!response) return

    const text = await response.text()

    const contentType = response.headers && response.headers.get("content-type")

    if (!contentType || contentType.indexOf("application/json") == -1) {
        return text
    }

    return JSON.parse(text, dateReviver)
}

async function confirmSuccessResponse(response, options: ClientOptions) {
    if (response.status >= 200 && response.status < 300) {
        return response
    }

    const text = await response.text() || response.statusText

    const serverError = new ServerError(response.status, text)
    options.onServerError && options.onServerError(serverError)

    throw serverError
}

export class ServerError extends Error {
    code: number

    constructor(code, message) {
        super(message)

        this.code = code
    }
}

export const ISO8601 = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/

export function dateReviver(key, val) {
    if (typeof val == "string") {
        // DateTime
        if (ISO8601.test(val)) {
            return new Date(val)
        }

        // Date
        if (/^\d\d\d\d-\d\d-\d\d$/.test(val)) {
            return new Date(val)
        }
    }

    return val
}