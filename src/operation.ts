export class OperationDescription {
    constructor(private operationName: string, private args = []) {
    }

    getMethod(): "GET" | "POST" {
        return this.operationName.startsWith("get")
            ? "GET"
            : "POST"
    }

    getUrl() {
        return "/" + camelCaseToDash(this.stripOperationPrefix()) + this.getQueryString()
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
            return true
        }

        return false
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
                return stripped[0].toLowerCase() + stripped.substring(1)
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