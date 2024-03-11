import {RouterContext} from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { UserService } from "../service/userService.ts";
import { User } from "../model/User.ts";
import { BAD_REQUEST, CREATED, INTERNAL_ERROR, OK } from "../config/macros.ts";
import { NOT_FOUND } from "../config/macros.ts";
import { container } from "../container.ts";

export class UserController {

    public userService: UserService;

    constructor() {
        const contResult = container.resolve("UserService");

        if(contResult == null) {
            this.userService = new UserService();
        } else {
            this.userService = contResult;
        }
    }

    async createUser(ctx: RouterContext<string>) {
        try {
            const requestBody = await ctx.request.body().value;

            console.log(requestBody);
    
            const passedUser = requestBody.valueOf();
    
            const passedUserName = passedUser.username;

            if (!passedUserName) {
                ctx.response.status = BAD_REQUEST; // Bad Request
                ctx.response.body = { message: "Name is required" };
                return;
            }
    
            const toCreate = new User(passedUser);
    
            const createdUser = await this.userService.createUser(toCreate);
    
            ctx.response.status = CREATED;
            ctx.response.body = { message: "User created", user: createdUser };
        } catch (error) {
            console.error(error.stack);
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error.message };
        }
    } 

    async getAllUsers(ctx: RouterContext<string>){
        try {
            const users = await this.userService.getAllUsers();
    
            ctx.response.status = OK;
    
            ctx.response.body = {
                message: "Users retrieved",
                users: users
            }

        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error.message};
        }
    } 

    async getUserByUsername(ctx: RouterContext<string>) {
        try {
            const { username } = ctx.params;
    
            if (!username){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Username is required" };
                return;
            }
    
            const user = await this.userService.getUserByUsername(username);
    
            ctx.response.status = OK;
    
            ctx.response.body = {
                message: "User retrieved",
                user: user
            }
    
        } catch (error){
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error};
        }
    }
    
    async deleteUserByUsername(ctx: RouterContext<string>){
        try {
            const { username } = ctx.params;
    
            if (!username) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Username is required" };
                return;
            }
    
            const deletedUser = await this.userService.deleteUser(username);
    
            if (deletedUser) {
                ctx.response.status = OK;
                ctx.response.body = { message: "User deleted" };
            } else {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = { message: "User not found" };
            }
        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error };
        }
    }
}