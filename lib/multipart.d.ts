export declare class Multipart {
    readonly files: {
        [key: string]: any;
    };
    readonly fields: {
        [key: string]: string;
    };
    constructor(files?: {
        [key: string]: any;
    }, fields?: {
        [key: string]: string;
    });
}
