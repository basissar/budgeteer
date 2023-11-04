
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

class Database {
    client: Client | null = null;

    constructor() {
        this.connect();
    }

    async connect() {
        this.client = new Client({
            user: "s.basista02",
            database: "neondb",
            hostname: "ep-shy-king-91134224.eu-central-1.aws.neon.tech",
            password: "..."
        })
        await this.client.connect();
    }
}

export default new Database();