export class Multipart {
    constructor(public readonly files: { [key: string]: File } = {}, public readonly fields: { [key: string]: string } = {}) {
    }
}