import { RouterContext } from '@oak/oak';
import { UserService } from "../service/userService.ts";
import { User } from "../model/User.ts";
import {
    BAD_REQUEST,
    CREATED,
    OK,
    UNAUTHORIZED,
    NOT_FOUND,
    CONFLICT,
    BLUE, RESET_COLOR
} from "../config/macros.ts";
import { verify } from 'https://deno.land/x/djwt@v2.4/mod.ts';
import { key } from "../utils/apiKey.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import {UserUpdatePayload} from "../model/UserUpdatePayload.ts";

export class UserController {

    public userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async register(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const user = new User(requestBody);

        try {
            const createdUser = await this.userService.register(user);

            if (createdUser) {
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
            if (error instanceof DuplicateError) {
                ctx.response.status = CONFLICT;
                ctx.response.body = {
                    message: "User with provided credentials already exists",
                }
            }
        }
    }

    async login(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const username = requestBody.username;

        const password = requestBody.password;

        if (!username || !password) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = {
                message: "Username or password missing"
            }
            return;
        };

        const result = await this.userService.login(username, password);

        if (!result) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = {
                message: "Invalid username or password"
            }
            return;
        }


        ctx.cookies.set("jwt_token", result.token,{
            httpOnly: true,
            // secure: true, //if used on https
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });

        ctx.cookies.set("user_id", result.user.id, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });

        ctx.response.status = OK;
        // ctx.response.body = { message: "Login successful", username: username, id: result.id, token: result.token };
        ctx.response.body = { message: "Login successful", username: result.user.username, id: result.user.id, email: result.user.email };
    }

    logout(ctx: RouterContext<string>) {
        ctx.cookies.delete("jwt_token");

        ctx.response.status = OK;
        ctx.response.body = { message: "Logout successful"};
        return;
    }

    async restoreSession(ctx: RouterContext<string>) {
        const jwt_token = await ctx.cookies.get("jwt_token");

        if (!jwt_token) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = {
                message: "No active session"
            };
            return;
        }

        const result = await verify(jwt_token,key);

        if (!result) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = {message: 'Invalid token or expired'};
            return;
        }

        const userIdFromToken = (result as { payload: { id: string } }).payload.id;

        const user = await this.userService.getUserInfo(userIdFromToken);

        if (!user) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = { message: "User not found" };
            return;
          }

        ctx.response.status = 200;
        ctx.response.body = { user: user };
    }

    async createUser(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const passedUserName = requestBody.username;

        if (!passedUserName) {
            ctx.response.status = BAD_REQUEST; 
            ctx.response.body = { message: "Name is required" };
            return;
        }

        const toCreate = new User(requestBody);

        const createdUser = await this.userService.createUser(toCreate);

        ctx.response.status = CREATED;
        ctx.response.body = { message: "User created", user: createdUser };
    }

    async getAllUsers(ctx: RouterContext<string>) {
        const users = await this.userService.getAllUsers();

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Users retrieved",
            users: users
        }
    }

    async getUserByUsername(ctx: RouterContext<string>) {
        const { username } = ctx.params;

        if (!username) {
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
    }

    async deleteUser(ctx: RouterContext<string>) {
        const id = await ctx.cookies.get("user_id");

        const {userId} = ctx.params;

        // const deletedUser = await this.userService.deleteUser(id!);
        const deletedUser = await this.userService.deleteUser(userId);

        ctx.cookies.delete("jwt_token");
        ctx.cookies.delete("user_id");

        if (deletedUser) {
            ctx.response.status = OK;
            ctx.response.body = { message: "User deleted" };
        } else {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = { message: "User not found" };
        }
    }

    async updateUser(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const {userId} = ctx.params;

        const id = await ctx.cookies.get("user_id");

        const updatePayload = new UserUpdatePayload();
        // updatePayload.id = id!;
        updatePayload.id = userId;
        updatePayload.username = requestBody.username;
        updatePayload.email = requestBody.email;

        console.log(BLUE, "INSIDE UPDATE", RESET_COLOR);
        console.log(updatePayload);

        try {
            const updatedUser = await this.userService.updateUser(updatePayload);

            ctx.response.status = OK;
            ctx.response.body = { message: "User updated", user: updatedUser};
            return;
        } catch (error) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: error}
            return;
        }
    }

}