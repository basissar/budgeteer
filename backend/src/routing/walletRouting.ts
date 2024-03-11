import {RouterContext} from "https://deno.land/x/oak@v12.6.1/router.ts";
import {BAD_REQUEST, CREATED, INTERNAL_ERROR, OK} from "../config/macros.ts";
import {Wallet} from "../model/Wallet.ts";
import {walletService} from "../service/walletService.ts";
import {userService} from "../service/userService.ts";

export async function createWallet(ctx: RouterContext<string>){
    try {
        const requestBody = await ctx.request.body().value;

        const passedWallet = requestBody.valueOf();

        if (!passedWallet.id || !passedWallet.name || !passedWallet.userId){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "Id, userId and name is required"};
            return
        }

        const newWallet: Wallet = {
            id: passedWallet.id,
            userId: passedWallet.userId,
            name: passedWallet.name
        }

        const createdWallet = await walletService.createWallet(newWallet);

        ctx.response.status = CREATED;
        ctx.response.body = {
            message: "Wallet created",
            wallet: createdWallet
        }
    } catch (error){
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}

export async function getAllWalletsForUser(ctx: RouterContext<string>){
    try {
        const { userId } = ctx.params;

        if(!userId){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "User ID is required"};
            return;
        }

        const wallets = await walletService.getAllWalletsForUser(Number(userId));

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallets retrieved",
            wallets: wallets
        }

    } catch (error){
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}

export async function getWalletForUser(ctx: RouterContext<string>){
    try {
        const { userId, walletId } = ctx.params;

        if(!userId || !walletId){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "User ID and wallet ID is required"};
            return;
        }

        const userExists = await userService.existsUser(Number(userId));

        if (!userExists){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "User with ID: " + Number(userId) +" not found"};
            return;
        }

        const wallet = await walletService.getWallet(Number(walletId));

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallet retrieved",
            wallets: wallet
        }

    } catch (error){
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}