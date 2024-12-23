import { container } from "../utils/container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import {User} from "../model/User.ts";
import {UserRepository} from "../repository/userRepository.ts"
import { compare, hash} from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { key } from "../utils/apiKey.ts";
import {UserUpdatePayload} from "../model/UserUpdatePayload.ts";
import {ValidationError} from "../errors/ValidationError.ts";

// import { Injectable } from "https://deno.land/x/inject@v0.1.2/mod.ts";


export class UserService {

    public repository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.repository = userRepository;
    }

    async createUser(user: User): Promise<User | null> {
        try {
            const exists = await this.existsByUsername(user.username);

            if(exists){
                throw new Error(`User ${user.username} already exists`);
            }

            return await this.repository.save(user);
        } catch (error) {
            console.error((error as Error).stack);
            throw new Error((error as Error).message);
        }   
    }

    async register(user: User) {
            let existsByEmail;
            let existsByUsername;

            try {
                existsByUsername = await this.existsByUsername(user.username);

                existsByEmail = await this.existsByEmail(user.email);
            } catch (err) {
                throw new ServiceError(`User service error: ${(err as Error).message}`);
            }
            

            if(existsByUsername || existsByEmail) {
                throw new DuplicateError(`User with provided credentials already exists`);
            }

            const hashedPassword = await hash(user.password);

            user.password = hashedPassword;

            return await this.repository.save(user);
    }

    async login(username: string, password: string) {
        const user = await this.repository.findByUsername(username);

        if(!user) {
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

        return {token: jwt, user: user};
    }

    async updateUser(userUpdatePayload: UserUpdatePayload) {
        const foundUser = await this.repository.findById(userUpdatePayload.id);

        if(!foundUser) {
            return null;
        }

        const isValid = await this.existingUserCheck(userUpdatePayload, foundUser.username, foundUser.email);

        if (!isValid) {
            throw new ValidationError(`User with provided credentials already exists`);
        }

        foundUser.set({
            username: userUpdatePayload.username,
            email: userUpdatePayload.email,
        });

        return await foundUser.save();
    }

    async getAllUsers(): Promise<User[] | null> {
       try {
           return await this.repository.findAll();
       } catch (e) {
           throw new ServiceError(`User service error: ${(e as Error).message}`);
       }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        try {
            return await this.repository.findByUsername(username);
        } catch (err) {
            throw new ServiceError(`User service error: ${(err as Error).message}`)
        }
        
    }

    async getUserInfo(id: string){
        return await this.repository.findById(id);
    }

    async deleteUser(id: string): Promise<boolean> {
        return  await this.repository.deleteById(id) != 0;
        // const result = await this.repository.setDeleted(id);
        // return result[0] > 0;
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
            throw new ServiceError('User service error: ' + (error as Error).message);
        }
    }

    async existsByEmail(email: string): Promise<boolean> {
        try{
            return await this.repository.existsByEmail(email);
        } catch (error) {
            throw new ServiceError('User service error: ' + (error as Error).message);
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

    async getUsersForCron(timezones: string[], recurrence: string){
        try {
            return await this.repository.getForCron(timezones, recurrence);
        } catch (error) {
            console.error('Error getting users: ' + error);
            return null;
        }
    }

    private async existingUserCheck(payloadCheck: UserUpdatePayload, username?: string, email?: string){
        if (payloadCheck.username !== username) {
            //username is not the same as current username, and we want to change it
            const existsByNewUsername = await this.repository.existsByUsername(payloadCheck.username);

            if (existsByNewUsername) {
                return false;
            }
        }

        if (payloadCheck.email !== email) {
            //email is not the same as current email and we want to change it
            const existsByEmail = await this.repository.existsByEmail(payloadCheck.email);

            if (existsByEmail) {
                return false;
            }
        }

        return true;
    }
}
