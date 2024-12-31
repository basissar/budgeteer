
export class Message {
    private _content: string;
    private _code: string;

    constructor(content: string, code: string) {
        this._content = content;
        this._code = code;
    }

    
    public get content() : string {
        return this._content;
    }

    public get code(): string {
        return this._code;
    }
    
}