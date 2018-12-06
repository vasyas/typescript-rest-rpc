"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var operation_1 = require("./operation");
var multipart_1 = require("./multipart");
var moment = require("moment");
function createClient(targetUrl, options, operationNames) {
    if (options === void 0) { options = {}; }
    if (targetUrl.endsWith("/"))
        targetUrl = targetUrl.substring(0, targetUrl.length - 1);
    if (operationNames) {
        return operationNames.reduce(function (r, operationName) {
            r[operationName] = restCall(targetUrl, operationName, options);
            return r;
        }, {});
    }
    else {
        return new Proxy({}, {
            get: function (target, operationName) {
                return restCall(targetUrl, operationName, options);
            }
        });
    }
}
exports.createClient = createClient;
var ClientOperationDescription = /** @class */ (function (_super) {
    __extends(ClientOperationDescription, _super);
    function ClientOperationDescription(operationName, args) {
        var _this = _super.call(this, operationName) || this;
        _this.args = args;
        return _this;
    }
    ClientOperationDescription.prototype.getUrl = function () {
        return _super.prototype.getUrl.call(this) + this.getQueryString();
    };
    ClientOperationDescription.prototype.getBody = function () {
        if (this.getMethod() == "GET")
            return null;
        var arg = this.args[0];
        if (this.convertToJson()) {
            return JSON.stringify(arg);
        }
        if (arg instanceof multipart_1.Multipart) {
            var multipart_2 = arg;
            var formData_1 = new FormData();
            Object.keys(multipart_2.fields).forEach(function (name) {
                formData_1.append(name, multipart_2.fields[name]);
            });
            Object.keys(multipart_2.files).forEach(function (name) {
                formData_1.append(name, multipart_2.files[name]);
            });
            return formData_1;
        }
        return arg;
    };
    ClientOperationDescription.prototype.getHeaders = function () {
        if (this.convertToJson()) {
            return { "Content-Type": "application/json" };
        }
        return {};
    };
    ClientOperationDescription.prototype.convertToJson = function () {
        if (!this.args.length)
            return false;
        var arg = this.args[0];
        if (typeof arg == "number")
            return true;
        if (typeof arg != "object")
            return false;
        if (arg instanceof multipart_1.Multipart)
            return false;
        return true;
    };
    ClientOperationDescription.prototype.getQueryString = function () {
        if (this.getMethod() != "GET")
            return "";
        var r = "";
        var arg = this.args[0];
        if (arg) {
            Object.keys(arg).forEach(function (key) {
                if (arg[key] == null)
                    return;
                var values = Array.isArray(arg[key]) ? arg[key] : [arg[key]];
                for (var i = 0; i < values.length; i++) {
                    if (r != "")
                        r += "&";
                    r += key + "=" + encodeURIComponent(formatParam(values[i]));
                }
            });
        }
        return r ? "?" + r : "";
    };
    return ClientOperationDescription;
}(operation_1.OperationDescription));
exports.ClientOperationDescription = ClientOperationDescription;
function restCall(targetUrl, operationName, options) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length > 1) {
            throw new Error("Operation '" + operationName + "', expecting 0 or 1 arguments, got " + args.length);
        }
        var parsedOperation = new ClientOperationDescription(operationName, args);
        var headers = options.supplyHeaders ? options.supplyHeaders() : {};
        return new Promise(function (resolve, reject) {
            fetch(targetUrl + parsedOperation.getUrl(), {
                method: parsedOperation.getMethod(),
                body: parsedOperation.getBody(),
                headers: __assign({}, headers, parsedOperation.getHeaders()),
                cache: "no-cache",
                credentials: "same-origin"
            })
                .then(function (response) { return confirmSuccessResponse(response, options); })
                .then(function (response) {
                options.onResponse && options.onResponse(response);
                return response;
            })
                .then(function (response) { return parseResponse(response); })
                .then(function (response) { return resolve(response); })
                .catch(function (error) { return reject(error); });
        });
    };
}
function parseResponse(response) {
    return __awaiter(this, void 0, void 0, function () {
        var contentType, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!response)
                        return [2 /*return*/];
                    contentType = response.headers && response.headers.get("content-type");
                    if (!contentType)
                        return [2 /*return*/, response];
                    if (!(contentType.indexOf("text") == 0 || contentType.indexOf("application/json") == 0)) {
                        return [2 /*return*/, response];
                    }
                    return [4 /*yield*/, response.text()];
                case 1:
                    text = _a.sent();
                    if (contentType.indexOf("application/json") == 0) {
                        return [2 /*return*/, JSON.parse(text, dateReviver)];
                    }
                    return [2 /*return*/, text];
            }
        });
    });
}
function confirmSuccessResponse(response, options) {
    return __awaiter(this, void 0, void 0, function () {
        var text, serverError, contentType, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (response.status >= 200 && response.status < 300) {
                        return [2 /*return*/, response];
                    }
                    return [4 /*yield*/, response.text()];
                case 1:
                    text = (_a.sent()) || response.statusText;
                    contentType = response.headers && response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") == 0) {
                        serverError = new ServerError(response.status);
                        parsed = JSON.parse(text, dateReviver);
                        Object.assign(serverError, parsed);
                    }
                    else {
                        serverError = new ServerError(response.status, text);
                    }
                    options.onServerError && options.onServerError(serverError);
                    throw serverError;
            }
        });
    });
}
var ServerError = /** @class */ (function (_super) {
    __extends(ServerError, _super);
    function ServerError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        return _this;
    }
    return ServerError;
}(Error));
exports.ServerError = ServerError;
exports.ISO8601 = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/;
function dateReviver(key, val) {
    if (typeof val == "string") {
        // match Java's DateTime
        if (exports.ISO8601.test(val)) {
            return new Date(val);
        }
        // match Java's Date
        if (/^\d\d\d\d-\d\d-\d\d$/.test(val)) {
            return new Date(val);
        }
    }
    return val;
}
exports.dateReviver = dateReviver;
function formatParam(param) {
    function pad2(n) {
        if (n < 10)
            return "0" + n;
        return "" + n;
    }
    // 2007-12-03 is backend accepted format
    if (param instanceof Date) {
        return param.getFullYear() + "-" + pad2(1 + param.getMonth()) + "-" + pad2(param.getDate());
    }
    if (moment.isMoment(param)) {
        return param.year() + "-" + pad2(1 + param.month()) + "-" + pad2(param.date());
    }
    return "" + param;
}
function download(response, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var blobby, objectUrl, anchor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.blob()];
                case 1:
                    blobby = _a.sent();
                    objectUrl = window.URL.createObjectURL(blobby);
                    anchor = document.createElement("a");
                    anchor.href = objectUrl;
                    anchor.download = fileName;
                    anchor.click();
                    window.URL.revokeObjectURL(objectUrl);
                    return [2 /*return*/];
            }
        });
    });
}
exports.download = download;
