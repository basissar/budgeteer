export class NotEnoughCreditsError extends Error {
    constructor(message: string){
        super(message);
        this.name = "NoteEnoughCreditsErrror";
    }
}