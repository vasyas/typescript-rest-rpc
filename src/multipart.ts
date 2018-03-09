export class Multipart {
    constructor(public readonly files: { [key: string]: any } = {}, public readonly fields: { [key: string]: string } = {}) {
    }
}