import { RouterContext } from "@oak/oak";
import {  CONFLICT, CREATED, OK } from "../config/macros.ts";
import { AccountService } from "../service/accountService.ts";
import { ItemService } from "../service/itemService.ts";
import { NOT_FOUND } from "../config/macros.ts";
import { NotEnoughCreditsError } from "../errors/NotEnoughCreditsError.ts";
import { AvatarService } from "../service/avatarService.ts";


export class AccountController {

    private accountService: AccountService;

    private itemService: ItemService;

    private avatarService: AvatarService;

    constructor(accountService: AccountService, itemService: ItemService, avatarService: AvatarService) {
        this.accountService = accountService;
        this.itemService = itemService;
        this.avatarService = avatarService;
    }

    /**
     * Creates account
     * @param ctx 
     */
    public async createAccount(ctx: RouterContext<string>) {
        const { userId } = ctx.params;

        const requestBody = await ctx.request.body.json();

        const avatarId = requestBody.avatarId;

        const createdAccount = await this.accountService.createAccount(userId, Number(avatarId));

        ctx.response.status = CREATED;
        ctx.response.body = {
            message: "Account created successfully",
            account: createdAccount
        }
    }

    /**
     * Retrieves account
     * @param ctx 
     */
    public async getAccount(ctx: RouterContext<string>) {
        const { userId } = ctx.params;

        const serviceResponse = await this.accountService.findByUser(userId);

        if ( serviceResponse == null) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: "Account for user has not been found"
            }
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Account retrieved successfully",
            account: serviceResponse.account,
            neededXP: serviceResponse.neededXP
        }        
    }

    /**
     * Buys item
     * @param ctx 
     * @returns 
     */
    public async buyItem(ctx: RouterContext<string>) {

        const {userId, itemId} = ctx.params;

        let wantedItem;

        try {
            wantedItem = await this.itemService.buyItem(Number(itemId), userId);
        } catch (err) {
            if (err instanceof NotEnoughCreditsError){
                ctx.response.status = CONFLICT;
                ctx.response.body = {
                    message: "You do not have enough credits to buy this item"
                }
                return;
            }
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Item bought successfully",
            item: wantedItem,
        }
    }

    /**
     * Equipes item
     * @param ctx 
     * @returns 
     */
    public async equipItem(ctx: RouterContext<string>){
        const { userId, itemId } = ctx.params;

        const equippedItem = await this.itemService.equipItem(Number(itemId), userId);

        if (!equippedItem) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: "Item has not been found"
            }
            return;
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Item equipped successfully",
            item: equippedItem
        }
    }

    /**
     * Uneqeuip item
     * @param ctx 
     * @returns 
     */
    public async unequipItem(ctx: RouterContext<string>){
        const { userId, itemId } = ctx.params;

        const unequippedItem = await this.itemService.unequipItem(Number(itemId), userId);

        if (!unequippedItem) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: "Item has not been found"
            }
            return;
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Item unequipped successfully",
            item: unequippedItem,
        }

    }

    /**
     * Retrieves avatar items
     * @param ctx 
     */
    public async getAvatarItems(ctx: RouterContext<string>) {
        const {avatarId} = ctx.params;

        const foundItems = await this.itemService.findByAvatar(Number(avatarId));

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Items retrieved successfully",
            items: foundItems
        }
    }

    /**
     * Retrieves all avatars
     * @param ctx 
     */
    public async getAllAvatars(ctx: RouterContext<string>) {
        const avatars = await this.avatarService.getAllAvatars();

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Avatars retreived successfully",
            avatars: avatars
        }
    }

}