/** Based on @types/koa-multer */
export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

export class Multipart {
    constructor(public readonly files: { [key: string]: File } = {}, public readonly fields: { [key: string]: string } = {}) {
    }
}