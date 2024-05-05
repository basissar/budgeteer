//todo

import { RouterContext } from "https://deno.land/x/oak@v12.6.1/router.ts";
import { BAD_REQUEST, CATEGORY_SERVICE, INTERNAL_ERROR, OK, UNAUTHORIZED, WALLET_SERVICE } from "../config/macros.ts";
import { USER_SERVICE } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { CategoryService } from "../service/categoryService.ts";
import { UserService } from "../service/userService.ts";
import { WalletService } from "../service/walletService.ts";
import { Category } from "../model/Category.ts";
import { CREATED } from "../config/macros.ts";

export class CategoryController {
    public userService: UserService;

    public categoryService: CategoryService;

    public walletService: WalletService;

    constructor(){
        const userSer = container.resolve(USER_SERVICE);
        const catSer = container.resolve(CATEGORY_SERVICE);
        const walletSer = container.resolve(WALLET_SERVICE);

        if (userSer == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = userSer;
        }

        if (catSer == null) {
            const newCatSer = new CategoryService();
            container.register(CATEGORY_SERVICE, newCatSer);
            this.categoryService = newCatSer;
        } else {
            this.categoryService = catSer;
        }

        if (walletSer == null) {
            const newWalletSer = new WalletService();
            container.register(WALLET_SERVICE, newWalletSer);
            this.walletService = newWalletSer;
        } else {
            this.walletService = walletSer;
        }
    }


    async createCategory(ctx: RouterContext<string>){
        try {
            const { userId: receivedUserId, walletId: receivedWalletId } = ctx.params;

            const userExists = await this.userService.exists(receivedUserId);

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Cannot create category for nonexisting user"};
                return;
            }

            const walletExists = await this.walletService.exists(receivedWalletId);

            if (!walletExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `Wallet with id: ${receivedWalletId} does not exist` };
                return;
            }

            const belongsToUser = await this.walletService.belongsToUser(receivedUserId, receivedWalletId);

            if (!belongsToUser) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: `User with id: ${receivedUserId} is not authorized to access wallet with id: ${receivedWalletId}`};
                return;
            }

            const requestBody = await ctx.request.body().value;

            const passedCategory = requestBody.valueOf();

            const toCreate = new Category(passedCategory);

            const createdCategory = await this.categoryService.createCategory(toCreate);

            if (createdCategory == null){
                //todo
            }

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Category created successfully",
                category: createdCategory
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR,
            ctx.response.body = {message: err.message};
        }
    }

    async getAllByWallet(ctx: RouterContext<string>) {
        try {
            const {userId, walletId} = ctx.params;

            if (!userId || !walletId) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "User ID and wallet ID are required"};
                return;
            }

            const userExists = await this.userService.exists(userId);

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: "Cannot get category for nonexisting user"};
                return;
            }

            const walletExists = await this.walletService.exists(walletId);

            if (!walletExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `Wallet with id: ${walletId} does not exist` };
                return;
            }

            const categories = await this.categoryService.getAllForUserInWallet(userId, walletId);

            if(categories.length == 0){
                //default categories are expected at least
                //it is never empty
                ctx.response.status = INTERNAL_ERROR;
                ctx.response.body = { mesage: "No categories retrieved, error... somewhere"};
                return;
            }

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Categories retrieved successfully",
                categories: categories
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { mesage: err.message };
        }
    }
}