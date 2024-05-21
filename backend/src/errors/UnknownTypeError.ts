export class UnknownTypeError extends Error {
    constructor(message: string){
        super(message);
        this.name = "UnknownTypeError";
    }
}