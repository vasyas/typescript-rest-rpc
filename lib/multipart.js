"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Multipart = /** @class */ (function () {
    function Multipart(files, fields) {
        if (files === void 0) { files = {}; }
        if (fields === void 0) { fields = {}; }
        this.files = files;
        this.fields = fields;
    }
    return Multipart;
}());
exports.Multipart = Multipart;
