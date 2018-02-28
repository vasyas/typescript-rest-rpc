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
    return function(args): Promise<any> {
        if (args.length > 1) {
            throw new Error(`Operation '${ operationName }', expecting 0 or 1 arguments, got ${ args.length }`)
        }

        console.log(`Invoking '${ operationName }' on ${ targetUrl }`)

        const parsedOperation = new ParsedOperation(operationName, args)

        return new Promise((resolve, reject) => {
            fetch(targetUrl + "/" + parsedOperation.getUrl(), {
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

class ParsedOperation {
    constructor(private operationName, private args) {
    }

    getMethod(): "GET" | "POST" {
        return this.operationName.startsWith("get")
            ? "GET"
            : "POST"
    }

    getUrl() {
        return camelCaseToDash(this.stripOperationPrefix()) + this.getQueryString()
    }

    getBody() {
        if (this.getMethod() == "GET") return null

        if (this.convertToJson()) {
            return JSON.stringify(this.args[0])
        }

        return this.args[0]
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

        // of all objects, do not convert FormData
        if (typeof FormData == "undefined" || !(arg instanceof FormData)) {
            return false
        }

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

    private stripOperationPrefix() {
        const strippedPrefixes = [
            "get", "set", "update", "create"
        ]

        for (const prefix of strippedPrefixes) {
            if (this.operationName.startsWith(prefix) && this.operationName.length > prefix.length) {
                const stripped = this.operationName.substring(prefix.length)
                stripped[0] = stripped[0].toLowerCase()
                return stripped
            }
        }

        return this.operationName
    }
}

function camelCaseToDash(s) {
    return s.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase()
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

    // if (moment.isMoment(param)) {
    //     return `${param.year()}-${pad2(1 + param.month())}-${pad2(param.date())}`
    // }

    return "" + param
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