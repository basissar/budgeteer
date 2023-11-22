//import client from "../database/database.ts";
import {User} from "../model/User.ts";
import Database from "../database/database.ts";

export class userRepo {
    static async createUser(user: User): Promise<User> {
        await Database.client!.queryObject<User>(
            "INSERT INTO users (username) VALUES ($1)",
            [user.username]
        );

        return user;
    }

    static async getAllUsers(): Promise<User[]>{
        const result = await Database.client!.queryObject<User[]>(
            "SELECT * FROM users");


        return result.rows.map((row) => ({
            id: Number(row.id),
            username: row.username,
        }));
    };

    static async getUserByUsername(username: string): Promise<User> {
        const result = await Database.client!.queryObject<User>(
            "SELECT * FROM users WHERE username = $1",
            [username]);



        return result.rows.map((row) => ({
            id: Number(row.id),
            username: row.username,
        }));
    }

    static async deleteUserByUsername(username: string): Promise<boolean> {
        try {
            const result = await Database.client!.queryObject(
                "DELETE FROM users WHERE username = $1",
                [username]
            );

            return result.rowCount === 1;

        } catch (error){
            throw error;
        }
    }

    static async existsById(id: bigint): Promise<boolean> {
        try{
            const result = await Database.client!.queryObject(
                "SELECT EXISTS (SELECT 1 FROM users WHERE \"userId\" = $1)",
                [id]
            );

            return result;
        } catch (error){
            throw error;
        }
    }
}