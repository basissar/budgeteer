import {WalletService} from "../service/walletService.ts";
import {RouterContext} from "https://deno.land/x/oak@v12.6.1/router.ts";
import {BAD_REQUEST, CREATED, INTERNAL_ERROR, OK, UNAUTHORIZED} from "../config/macros.ts";
import {Wallet} from "../model/Wallet.ts";
import { UserService } from "../service/userService.ts";
import { container } from "../container.ts";

export class WalletController {

    public userService: UserService;

    public walletService: WalletService;

    constructor(){
        const userSer = container.resolve("UserService");
        const walletSer = container.resolve("WalletService");

        if (userSer == null) {
            const newUserSer = new UserService();
            container.register("UserService", newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = userSer;
        }

        if (walletSer == null) {
            const newWalletSer = new WalletService();
            container.register("WalletService", newWalletSer);
            this.walletService = newWalletSer;
        } else {
            this.walletService = walletSer;
        }
    }

    async createWallet(ctx: RouterContext<string>){
        try {
            const { userId: receivedUserId } = ctx.params;

            const userExists = await this.userService.exists(Number(receivedUserId));

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Cannot create wallet for nonexisting user"};
                return;
            }

            const token = ctx.request.headers.get('Authorization')?.split(' ')[1];

            if (!token) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: 'Authorization token missing' };
                return;
            }

            const tokenId = await this.userService.getCurrentUserId(token);

            if (!tokenId) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: 'Invalid token or expired' };
                return;
            }

            if (tokenId != Number(receivedUserId)){
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: 'Token does not match user ID' };
                return;
            }

            const requestBody = await ctx.request.body().value;

            const passedWallet = requestBody.valueOf();

            if(!passedWallet.name || !passedWallet.userId){
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "UserId and name is required"};
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