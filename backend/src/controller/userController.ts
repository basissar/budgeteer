import { RouterContext } from '@oak/oak';
import { UserService } from "../service/userService.ts";
import { User } from "../model/User.ts";
import { BAD_REQUEST, CREATED, INTERNAL_ERROR, OK, UNAUTHORIZED, NOT_FOUND, CONFLICT, USER_SERVICE } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { verify } from 'https://deno.land/x/djwt@v2.4/mod.ts';
import { key } from "../utils/apiKey.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";

export class UserController {

    public userService: UserService;

    constructor() {
        const contResult = container.resolve(USER_SERVICE);

        if (contResult == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = contResult;
        }
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

        ctx.response.status = OK;
        ctx.response.body = { message: "Login successful", username: username, id: result.id, token: result.token };
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

    async deleteUserByUsername(ctx: RouterContext<string>) {
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
    }

    async getUserInfo(ctx: RouterContext<string>) {
        const token = ctx.request.headers.get('Authorization');

        if (!token) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: "Unauthorized: Token Missing" };
            return;
        }

        const isValid = await this.userService.verifyToken(token.split(" ")[1]);

        if (!isValid) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: "Unauthorized: Invalid Token" };
            return;
        }

        const payload = await verify(token.split(" ")[1], key);

        const userId = (payload as { payload: { id: string } }).payload.id;
        const username = (payload as { payload: { username: string } }).payload.username;


        ctx.response.status = OK;
        ctx.response.body = {
            user: {
                id: userId,
                username: username
            }
        }
    }
}