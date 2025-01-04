import {WalletService} from "../service/walletService.ts";
import {RouterContext} from "@oak/oak";
import {BAD_REQUEST, CREATED, NOT_FOUND, OK, UNAUTHORIZED,} from "../config/macros.ts";
import {Wallet} from "../model/Wallet.ts";
import {UserService} from "../service/userService.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";

export class WalletController {

    public userService: UserService;

    public walletService: WalletService;

    constructor(userService: UserService, walletService: WalletService) {
        this.userService = userService; 
        this.walletService = walletService;
    }

    /**
     * Creates a new wallet
     * @param ctx 
     * @returns 
     */
    public async createWallet(ctx: RouterContext<string>) {
        const { userId: receivedUserId } = ctx.params;

        const userExists = await this.userService.exists(receivedUserId);

        if (!userExists) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "Cannot create wallet for nonexisting user" };
            return;
        }

        const passedWallet = await ctx.request.body.json();

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

    /**
     * Retrieves all wallets for user
     * @param ctx 
     */
    public async getAllWalletsForUser(ctx: RouterContext<string>) {
        const { userId } = ctx.params;

        const wallets = await this.walletService.getAllWalletsForUser(userId);

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallets retrieved",
            wallets: wallets
        }
    }

    /**
     * Retrieves specific wallet for user
     * @param ctx 
     */
    public async getWallet(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const userId = await ctx.cookies.get('user_id');

        const wallet = await this.walletService.getWallet(walletId, userId!);

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Wallet retrieved",
            wallet: wallet
        }
    }

    /**
     * Deletes wallet
     * @param ctx 
     * @returns 
     */
    public async deleteWalletForUser(ctx: RouterContext<string>) {
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
            ctx.response.body = { message: `User is not authorized to access wallet with id: ${walletId}` };
            return;
        }

        const deleted = await this.walletService.deleteWallet( walletId);

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

    /**
     * Updates wallet
     * @param ctx 
     * @returns 
     */
    public async updateWallet(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const userId = await ctx.cookies.get("user_id");

        if (!userId) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = {message: "Unauthorized access to wallet edit."}
            return
        }
        
        const updates = await ctx.request.body.json();
    
        if (!updates || Object.keys(updates).length === 0) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "No updates provided." };
            return;
        }
    
        try {
            const updatedWallet = await this.walletService.updateWallet(userId!, walletId, updates);
    
            if (!updatedWallet) {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = { message: "Wallet not found or could not be updated." };
                return;
            }
    
            ctx.response.status = OK;
            ctx.response.body = {
                message: "Wallet updated successfully.",
                wallet: updatedWallet,
            };
        } catch (error) {
            ctx.response.status = error instanceof NotFoundError ? NOT_FOUND : UNAUTHORIZED;
            ctx.response.body = { message: (error as Error).message };
        }
    }

}