import { OperationDescription } from "./operation"
import { Multipart } from "./multipart"

export function createClient(targetUrl: string, options: ClientOptions = {}, operationNames?): any {
    if (targetUrl.endsWith("/"))
        targetUrl = targetUrl.substring(0, targetUrl.length - 1)

    if (operationNames) {
        return operationNames.reduce((r, operationName) => {
            r[operationName] = restCall(targetUrl, operationName, options)
            return r
        }, {})
    } else {
        return new Proxy({}, {
            get(target, operationName: string) {
                return restCall(targetUrl, operationName, options)
            }
        })
    }
}

export interface ClientOptions {
    supplyHeaders?(): object
    onServerError?(error: ServerError): void
    onResponse?(response: Response): void
}

class ClientOperationDescription extends OperationDescription {
    constructor(operationName: string, private args) {
        super(operationName)
    }

    getUrl() {
        return super.getUrl() + this.getQueryString()
    }

    getBody() {
        if (this.getMethod() == "GET") return null

        const arg = this.args[0]

        if (this.convertToJson()) {
            return JSON.stringify(arg)
        }

        if (arg instanceof Multipart) {
            const multipart = arg as Multipart
            const formData = new FormData()

            Object.keys(multipart.fields).forEach(name => {
                formData.append(name, multipart.fields[name])
            })

            Object.keys(multipart.files).forEach(name => {
                formData.append(name, multipart.files[name])
            })

            return formData
        }

        return arg
    }

    getHeaders() {
        if (this.convertToJson()) {
            return { "Content-Type": "application/json" }
        }

        return {}
    }

    private convertToJson(): boolean {
        if (!this.args.length) return false

        const arg = this.args[0]

        if (typeof arg == "number") return true
        if (typeof arg != "object") return false

        if (arg instanceof Multipart) return false

        return true
    }

    private getQueryString() {
        if (this.getMethod() != "GET") return ""

        if (!this.args.length) return ""

        let r = ""

        Object.keys(this.args).forEach(key => {
            if (this.args[key] == null) return

            if (r != "") r += "&"

            r += `${ key }=${ encodeURIComponent(formatParam(this.args[key])) }`
        })

        return `?${r}`
    }

}

function restCall(targetUrl: string, operationName: string, options: ClientOptions) {
    return function(...args): Promise<any> {
        if (args.length > 1) {
            throw new Error(`Operation '${ operationName }', expecting 0 or 1 arguments, got ${ args.length }`)
        }

        const parsedOperation = new ClientOperationDescription(operationName, args)

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
                .then(response => {
                    options.onResponse && options.onResponse(response)
                    return response;
                })
                .then(response => parseResponse(response))
                .then(response => resolve(response))
                .catch(error => reject(error))
        })
    }
}

async function parseResponse(response) {
    if (!response) return

    const contentType = response.headers && response.headers.get("content-type")
    if (!contentType) return response

    if (!(contentType.indexOf("text") == 0 || contentType.indexOf("application/json") == 0)) {
        return response
    }

    const text = await response.text()

    if (contentType.indexOf("application/json") == 0) {
        return JSON.parse(text, dateReviver)
    }

    return text
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
        // match Java's DateTime
        if (ISO8601.test(val)) {
            return new Date(val)
        }

        // match Java's Date
        if (/^\d\d\d\d-\d\d-\d\d$/.test(val)) {
            return new Date(val)
        }
    }

    return val
}

function formatParam(param) {
    function pad2(n) {
        if (n < 10) return "0" + n

        return "" + n
    }

    // 2007-12-03 is backend accepted format
    if (param instanceof Date) {
        return `${ param.getFullYear() }-${ pad2(1 + param.getMonth()) }-${ pad2(param.getDate()) }`
    }

    return "" + param
}

export async function download(response, fileName) {
    const blobby = await response.blob()

    const objectUrl = window.URL.createObjectURL(blobby)

    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = fileName
    anchor.click()

    window.URL.revokeObjectURL(objectUrl)
}