import { container } from "../container.ts";
import {User} from "../model/User.ts";
import {UserRepository} from "../repository/userRepo.ts"

// import { Injectable } from "https://deno.land/x/inject@v0.1.2/mod.ts";


export class UserService {

    public repository: UserRepository;

    constructor() {
        const contResult = container.resolve("UserRepository");

        if (contResult == null) {
            this.repository = new UserRepository();
        } else {
            this.repository = contResult;
        }
        
        console.log("User service initialized");
    }

    /*
    constructor( repo: UserRepository) {
        this.repository = repo;
        console.log("user service constructor initialized");
        console.log(this.repository);
    }
    */

    async createUser(user: User): Promise<User | null> {
        try {
            const exists = await this.exists(user.username);

            if(exists){
                throw new Error(`User ${user.username} already exists`);
            }

            return await this.repository.save(user);
        } catch (error) {
            console.error(error.stack);
            throw new Error(error.message);
        }

        
    }

    async getAllUsers(): Promise<User[] | null> {
       try {
           return await this.repository.findAll();
       } catch (e) {
           throw new Error(e.stack);
       }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const userExists = await this.exists(username);

        if (!userExists){
            throw new Error("User with username " + username + " does not exist.");
        }

        return this.repository.findByUsername(username);
    }

    async deleteUser(username: string): Promise<boolean> {

        const userExists = await this.repository.existsByUsername(username);

        if (!userExists){
            throw new Error("User with username " + username + " does not exist.");
        }

        return  await this.repository.deleteByUsername(username) != 0;

    }

    async exists(identifier: string | number): Promise<boolean>{
        try {
            if (typeof identifier === 'string') {
                return await this.repository.existsByUsername(identifier);
            } else if (typeof identifier === 'number') {
                return await this.repository.existsById(identifier);
            } else {
                throw new Error('Invalid identifier type. Please provide a username (string) or ID (number).');
            }
        } catch (error) {
            throw new Error('Error checking user existence: ' + error);
        }
    }
}
