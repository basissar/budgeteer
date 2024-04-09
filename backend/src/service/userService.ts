import { container } from "../container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import {User} from "../model/User.ts";
import {UserRepository} from "../repository/userRepo.ts"
import { compare, hash} from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { key } from "../utils/apiKey.ts";

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
            const exists = await this.existsByUsername(user.username);

            if(exists){
                throw new Error(`User ${user.username} already exists`);
            }

            return await this.repository.save(user);
        } catch (error) {
            console.error(error.stack);
            throw new Error(error.message);
        }   
    }

    async register(user: User) {
        try{
            const existsByUsername = await this.existsByUsername(user.username);

            const existsByEmail = await this.existsByEmail(user.email);

            if(existsByUsername || existsByEmail) {
                throw new DuplicateError(`User with provided credentials already exists`);
            }

            const hashedPassword = await hash(user.password);

            user.password = hashedPassword;

            return await this.repository.save(user);
        } catch (error) {
            throw new ServiceError("User service error: " + error.stack);
        }
    }

    async login(username: string, password: string) {
        const user = await this.repository.findByUsername(username);

        if(!user) {
            // throw new NotFoundError(`User with ${username} not found`);
            console.warn(`User ${username} not found`);
            return null;
        }

        const passwordMatch = await compare(password, user.password);

        if(!passwordMatch) {
            return null;
        }

        const payload = {
            id: user.id,
            username: user.username,
            exp: getNumericDate(new Date().getTime() + 3600 * 1000),
        }

        const jwt = await create({ alg: "HS512", typ: "JWT" }, { payload }, key);

        // console.log(jwt);

        return {token: jwt, id: user.id};
    }

    async getAllUsers(): Promise<User[] | null> {
       try {
           return await this.repository.findAll();
       } catch (e) {
           throw new ServiceError(`User service error: ${e.message}`);
       }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const userExists = await this.existsByUsername(username);

        if (!userExists){
            // throw new NotFoundError("User with username " + username + " does not exist.");
            console.warn(`User with username: ${username} not found`);
            return null;
        }

        return this.repository.findByUsername(username);
    }

    async getUserInfo(id: string){
        return await this.repository.findById(id);
    }

    async deleteUser(username: string): Promise<boolean> {

        const userExists = await this.repository.existsByUsername(username);

        if (!userExists){
            // throw new Error("User with username " + username + " does not exist.");
            console.warn(`User with username ${username} not found`);
            return false;
        }

        return  await this.repository.deleteByUsername(username) != 0;

    }

    async exists(identifier: string): Promise<boolean>{
        try {
            return await this.repository.exists(identifier);
        } catch (error) {
            throw new Error('Error checking user existence: ' + error);
        }
    }

    async existsByUsername(username: string): Promise<boolean>{
        try{
            return await this.repository.existsByUsername(username);
        } catch (error) {
            throw new ServiceError('User service error: ' + error.message);
        }
    }

    async existsByEmail(email: string): Promise<boolean> {
        try{
            return await this.repository.existsByEmail(email);
        } catch (error) {
            throw new ServiceError('User service error: ' + error.message);
        }
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            await verify(token, key);
            return true;
        } catch {
            return false;
        }
    }

    async getCurrentUserId(token: string): Promise<string | null> {
        try {
            const result = await verify(token, key);

            const id = (result as { payload: { id: string } }).payload.id;

            return id;
        } catch (error) {
            console.error('Error verifying token: ' + error);
            return null;
        }
    }
}
