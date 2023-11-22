import {RouterContext} from "https://deno.land/x/oak@v12.6.1/router.ts";
import {userRepo} from "../repository/userRepo.ts";
import {User} from "../model/User.ts";
import {BAD_REQUEST, CREATED, INTERNAL_ERROR, OK} from "../macros.ts";

export async function createUser(ctx: RouterContext<string>) {

    //todo rewrite all using service

    try {

        //console.log(ctx.request.body());

        const requestBody = await ctx.request.body().value;

        const passedUser = requestBody.valueOf();

        const newUserName = passedUser.username;

        //todo rewrite validation into service layer
        if (!newUserName) {
            ctx.response.status = BAD_REQUEST; // Bad Request
            ctx.response.body = { message: "Name is required" };
            return;
        }

        const createdUser = await userRepo.createUser(new User(newUserName));

        ctx.response.status = CREATED;
        ctx.response.body = { message: "User created", user: createdUser };
    } catch (error) {
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}

export async function getAllUsers(ctx: RouterContext<string>) {
    try {
        const users = await userRepo.getAllUsers();

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Users retrieved",
            users: users }
    } catch (error) {
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error};
    }
}

export async function getUserByUsername(ctx: RouterContext<string>) {
    try {
        const { username } = ctx.params;

        if (!username){
            ctx.response.status = 400;
            ctx.response.body = { message: "Username is required" };
            return;
        }

        const user = await userRepo.getUserByUsername(username);

        ctx.response.status = 200;

        ctx.response.body = {
            message: "User retrieved",
            user: user
        }

    } catch (error){
        ctx.response.status = 500;
        ctx.response.body = { message: error};
    }
}

export async function deleteUserByUsername(ctx: RouterContext<string>){
    try {
        const { username } = ctx.params;

        if (!username) {
            ctx.response.status = 400;
            ctx.response.body = { message: "Username is required" };
            return;
        }

        const deletedUser = await userRepo.deleteUserByUsername(username);

        if (deletedUser) {
            ctx.response.status = 200;
            ctx.response.body = { message: "User deleted" };
        } else {
            ctx.response.status = 404;
            ctx.response.body = { message: "User not found" };
        }
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: error };
    }
}