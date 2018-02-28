import { OperationDescription } from "./operation"

export function createClient(targetUrl: string): any {
    if (targetUrl.endsWith("/"))
        targetUrl = targetUrl.substring(0, targetUrl.length - 1)

    return new Proxy({}, {
        get (target, key: string) {
            return restCall(targetUrl, key)
        }
    })
}

function restCall(targetUrl: string, operationName: string) {
    return function(...args): Promise<any> {
        if (args.length > 1) {
            throw new Error(`Operation '${ operationName }', expecting 0 or 1 arguments, got ${ args.length }`)
        }

        const parsedOperation = new OperationDescription(operationName, args)

        return new Promise((resolve, reject) => {
            fetch(targetUrl + parsedOperation.getUrl(), {
                method: parsedOperation.getMethod(),
                body: parsedOperation.getBody(),
                headers: parsedOperation.getHeaders(),
                cache: "no-cache",
                credentials: "same-origin"
            })
                .then(confirmSuccessResponse)
                .then(response => parseResponse(response))
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

async function confirmSuccessResponse(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    }

    // if (response.status == 401) {
    //     unauthorizedHandler()
    // }

    const text = await response.text() || response.statusText

    const error = response.status == 400 ? new Error(text) : new Error(`Error ${response.status} ` + text)

    error["code"] = response.status

    // if (response.status != 400) {
    //     serverErrorListener({
    //         when: new Date(),
    //         message: text
    //     })
    // }

    throw error
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