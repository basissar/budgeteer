import {WalletService} from "../service/walletService.ts";
import {RouterContext} from "https://deno.land/x/oak@v12.6.1/router.ts";
import {BAD_REQUEST, CREATED, INTERNAL_ERROR, OK} from "../config/macros.ts";
import {Wallet} from "../model/Wallet.ts";
import { UserService } from "../service/userService.ts";
import { container } from "../container.ts";

export class WalletController {

    public userService: UserService;

    public walletService: WalletService;

    constructor(){
        this.userService = container.resolve("UserService");
        this.walletService = container.resolve("WalletService");
    }

    async createWallet(ctx: RouterContext<string>){
        try {
            const requestBody = await ctx.request.body().value;

            const passedWallet = requestBody.valueOf();

            if(!passedWallet.id || !passedWallet.name || !passedWallet.userId){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Id, userId and name is required"};
                return
            }

            const newWallet = new Wallet({
                userId: passedWallet.userId,
                name: passedWallet.name
            });

            const createdWallet = await this.walletService.createWallet(newWallet);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Wallet created successfully",
                wallet: createdWallet
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message};
        }
    }

    async getAllWalletsForUser(ctx: RouterContext<string>){
        try {
            const userId = ctx.params;

            if (!userId){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "User ID is required"};
                return;
            }

            const wallets = await this.walletService.getAllWalletsForUser(Number(userId));

            ctx.response.status = OK;

            ctx.response.body = {
                message: "Wallets retrieved",
                wallets: wallets
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message };
        }
    }

    async getWalletForUser(ctx: RouterContext<string>){
        try {
            const {userId, walletId} = ctx.params;

            if(!userId || !walletId){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = {message: "User ID and Wallet ID are required"};
                return;
            }

            const wallet = await this.walletService.getWalletForUser(Number(walletId), Number(userId));

            ctx.response.status = OK;

            ctx.response.body = {
                message: "Wallet retrieved",
                wallets: wallet
            }

        } catch (error){
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error.message };
        }
    }


}