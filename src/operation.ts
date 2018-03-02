export class OperationDescription {
    constructor(private operationName: string) {
    }

    getMethod(): "GET" | "POST" {
        return this.operationName.startsWith("get")
            ? "GET"
            : "POST"
    }

    getUrl() {
        return "/" + camelCaseToDash(this.stripOperationPrefix())
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