"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperationDescription = /** @class */ (function () {
    function OperationDescription(operationName) {
        this.operationName = operationName;
    }
    OperationDescription.prototype.getMethod = function () {
        return this.operationName.startsWith("get")
            ? "GET"
            : "POST";
    };
    OperationDescription.prototype.getUrl = function () {
        return "/" + camelCaseToDash(this.stripOperationPrefix());
    };
    OperationDescription.prototype.stripOperationPrefix = function () {
        var strippedPrefixes = [
            "get", "set", "update", "create"
        ];
        for (var _i = 0, strippedPrefixes_1 = strippedPrefixes; _i < strippedPrefixes_1.length; _i++) {
            var prefix = strippedPrefixes_1[_i];
            if (this.operationName.startsWith(prefix) && this.operationName.length > prefix.length) {
                var stripped = this.operationName.substring(prefix.length);
                return stripped[0].toLowerCase() + stripped.substring(1);
            }
        }
        return this.operationName;
    };
    return OperationDescription;
}());
exports.OperationDescription = OperationDescription;
function camelCaseToDash(s) {
    return s.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}
