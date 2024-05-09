import {RouterContext} from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { UserService } from "../service/userService.ts";
import { User } from "../model/User.ts";
import { BAD_REQUEST, CREATED, INTERNAL_ERROR, OK, UNAUTHORIZED, NOT_FOUND } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { verify } from 'https://deno.land/x/djwt@v2.4/mod.ts';
import { key } from "../utils/apiKey.ts";
import { USER_SERVICE } from '../config/macros.ts';

export class UserController {

    public userService: UserService;

    constructor() {
        const contResult = container.resolve(USER_SERVICE);

        if(contResult == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = contResult;
        }
    }

    async register(ctx: RouterContext<string>){
        try {
            const requestBody = await ctx.request.body().value;

            const user = new User(requestBody.valueOf());

            const createdUser = await this.userService.register(user);

            if (createdUser) {
                //todo change this part to properly return needed information
                ctx.response.status = CREATED;
                ctx.response.body = {
                    message: "User registered", 
                    user: {
                        id: createdUser.id,
                        username: createdUser.username,
                        email: createdUser.email
                    }
                }
            }

            
        } catch (error) {
            console.error(error.stack);
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = {
                message: error.message
            };
        }
    }

    async login(ctx: RouterContext<string>){
        try{
            const requestBody = await ctx.request.body().value;

            const username = requestBody.valueOf().username;

            const password = requestBody.valueOf().password;

            if(!username || !password){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = {
                    message: "Username or password missing"
                }
                return;
            };

            const result = await this.userService.login(username, password);

            if(!result){
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = {
                    message: "Invalid username or password"
                }
                return;
            }            

            ctx.response.status = OK;
            // ctx.response.headers.set("Authorization", `Bearer ${result.token}`);
            ctx.cookies.set("token", result.token);
            ctx.response.body = { message: "Login successful", username: username, id:result.id, token: result.token};
        } catch (error){
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = {message: error.message}
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

            const token = ctx.request.headers.get('Authorization');

            if(!token) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Unauthorized: Token missing"};
                return;
            }

            const isValid = await this.userService.verifyToken(token.split(" ")[1]);

            if(!isValid){
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Unauthorized: Invalid token"};
                return;
            }

            const payload = await verify(token.split(" ")[1],key)

            if(payload.username != username){
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Unauthorized: Attempt to delete account that doesn't belong to user."}
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

    async getUserInfo(ctx: RouterContext<string>) {
        try {
            const token = ctx.request.headers.get('Authorization');

            if (!token) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Unauthorized: Token Missing"};
                return;
            }

            const isValid = await this.userService.verifyToken(token.split(" ")[1]);

            if(!isValid) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Unauthorized: Invalid Token"};
                return;
            }

            const payload = await verify(token.split(" ")[1], key);

            const userId = (payload as { payload: { id: string } }).payload.id;
            const username = (payload as { payload: { username: string } }).payload.username;


            ctx.response.status = OK;
            ctx.response.body = {user: {
                id: userId,
                username: username
            }}
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = {message: err.message}
        }
    }
}