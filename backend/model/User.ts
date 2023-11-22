
export class User {
    //todo rewrite as interface - id can be BigInt
    //todo add role as attribute

    username: string;

    constructor(username: string) {
        this.username = username;
    }
}
