import { WalletService } from "../service/walletService.ts";
import { RouterContext } from "https://deno.land/x/oak@v12.6.1/router.ts";
import { BAD_REQUEST, CREATED, INTERNAL_ERROR, NOT_FOUND, OK, UNAUTHORIZED, USER_SERVICE, WALLET_SERVICE } from "../config/macros.ts";
import { Wallet } from "../model/Wallet.ts";
import { UserService } from "../service/userService.ts";
import { container } from "../utils/container.ts";

export class WalletController {

    public userService: UserService;

    public walletService: WalletService;

    constructor() {
        const userSer = container.resolve(USER_SERVICE);
        const walletSer = container.resolve(WALLET_SERVICE);

        if (userSer == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = userSer;
        }

        if (walletSer == null) {
            const newWalletSer = new WalletService();
            container.register(WALLET_SERVICE, newWalletSer);
            this.walletService = newWalletSer;
        } else {
            this.walletService = walletSer;
        }
    }

    async createWallet(ctx: RouterContext<string>) {
        const { userId: receivedUserId } = ctx.params;

        const userExists = await this.userService.exists(receivedUserId);

        if (!userExists) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "Cannot create wallet for nonexisting user" };
            return;
        }

        const requestBody = await ctx.request.body().value;

        const passedWallet = requestBody.valueOf();

        if (!passedWallet.name || !passedWallet.userId) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "UserId and name is required" };
            return
        }

        const newWallet = new Wallet({
            userId: passedWallet.userId,
            name: passedWallet.name,
            currency: passedWallet.currency
        });

        const createdWallet = await this.walletService.createWallet(newWallet, passedWallet.initialAmount);

        ctx.response.status = CREATED;
        ctx.response.body = {
            message: "Wallet created successfully",
            wallet: createdWallet
        }
    }

    async getAllWalletsForUser(ctx: RouterContext<string>) {
        const { userId } = ctx.params;

        const wallets = await this.walletService.getAllWalletsForUser(userId);

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallets retrieved",
            wallets: wallets
        }
    }

    async getWalletForUser(ctx: RouterContext<string>) {
        const { userId, walletId } = ctx.params;

        const wallet = await this.walletService.getWalletForUser(walletId, userId);

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallet retrieved",
            wallets: wallet
        }
    }

    async deleteWalletForUser(ctx: RouterContext<string>) {
        const { userId, walletId } = ctx.params;

        if (!userId || !walletId) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "User ID and Wallet ID are required" };
            return;
        }

        const userExists = await this.userService.exists(userId);

        if (!userExists) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: `User with id: ${userId} does not exist` };
            return;
        }

        const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

        if (!belongsToUser) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
            return;
        }

        const deleted = await this.walletService.deleteWalletForUser(userId, walletId);

        if (deleted) {
            ctx.response.status = OK;
            ctx.response.body = {
                message: `Wallet deleted successfully.`
            }
        } else {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: `Wallet has not been found.`
            }
        }
    }

}