import { OperationDescription } from "./operation";
export declare function createClient(targetUrl: string, options?: ClientOptions, operationNames?: any): any;
export interface ClientOptions {
    supplyHeaders?(): object;
    onServerError?(error: ServerError): void;
    onResponse?(response: Response): void;
}
export declare class ClientOperationDescription extends OperationDescription {
    private args;
    constructor(operationName: string, args: any);
    getUrl(): string;
    getBody(): any;
    getHeaders(): {
        "Content-Type": string;
    } | {
        Content-Type?: undefined;
    };
    private convertToJson();
    private getQueryString();
}
export declare class ServerError extends Error {
    code: number;
    constructor(code: any, message?: any);
}
export declare const ISO8601: RegExp;
export declare function dateReviver(key: any, val: any): any;
export declare function download(response: any, fileName: any): Promise<void>;
