export declare class OperationDescription {
    private operationName;
    constructor(operationName: string);
    getMethod(): "GET" | "POST";
    getUrl(): string;
    private stripOperationPrefix();
}
