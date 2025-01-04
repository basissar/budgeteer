import { RouterContext } from "@oak/oak";
import { BAD_REQUEST, INTERNAL_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../config/macros.ts";
import { CategoryService } from "../service/categoryService.ts";
import { UserService } from "../service/userService.ts";
import { WalletService } from "../service/walletService.ts";
import { Category } from "../model/Category.ts";
import { CREATED } from "../config/macros.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";

export class CategoryController {
    public userService: UserService;

    public categoryService: CategoryService;

    public walletService: WalletService;

    constructor(userService: UserService, categoryService: CategoryService, walletService: WalletService) {
        this.userService = userService;
        this.categoryService = categoryService;
        this.walletService = walletService;
    }

    /**
     * Creates a new category in wallet
     * @param ctx 
     * @returns 
     */
    public async createCategory(ctx: RouterContext<string>) {
        try {
            const { walletId } = ctx.params;

            const walletExists = await this.walletService.exists(walletId);

            if (!walletExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `Wallet with id: ${walletId} does not exist` };
                return;
            }

            const requestBody = await ctx.request.body.json();

            const toCreate = new Category(requestBody);

            const createdCategory = await this.categoryService.createCategory(toCreate);

            if (createdCategory == null) {
                //todo
            }

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Category created successfully",
                category: createdCategory
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR,
                ctx.response.body = { message: (err as Error).message };
        }
    }

    /**
     * Retrieves all categories for wallet
     * @param ctx 
     * @returns 
     */
    public async getAllByWallet(ctx: RouterContext<string>) {
        try {
            const { walletId } = ctx.params;

            const categories = await this.categoryService.getAllForWallet(walletId);

            if (categories.length == 0) {
                //default categories are expected at least
                //it is never empty
                ctx.response.status = INTERNAL_ERROR;
                ctx.response.body = { mesage: "No categories retrieved, error... somewhere" };
                return;
            }

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Categories retrieved successfully",
                categories: categories
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { mesage: (err as Error).message };
        }
    }

    /**
     * Retrieves all default categories
     * @param ctx 
     */
    public async getAllDefault(ctx: RouterContext<string>) {
        try {
            const categories = await this.categoryService.getAllDefault();

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Default categories retrieved successfully",
                categories: categories
            }
        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: (error as Error).message };
        }
    }

    /**
     * Retrieves custom categories for wallet
     * @param ctx 
     */
    public async getCustomByWallet(ctx: RouterContext<string>) {
        try {
            const { walletId } = ctx.params;

            const categories = await this.categoryService.getCustomForWallet(walletId);

            if (categories == null || categories.length == 0) {
                ctx.response.status = OK;
                ctx.response.body = {
                    message: "No custom categories in wallet.",
                    categories: categories
                }
                return;
            }

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Custom categories retrieved successfully",
                categories: categories
            }
        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: (error as Error).message };
        }
    }

    /**
     * Deletes category
     * @param ctx 
     */
    public async deleteById(ctx: RouterContext<string>) {
        const { categoryId } = ctx.params;

        const deleted = await this.categoryService.deleteCategory(Number(categoryId));

        if (deleted) {
            ctx.response.status = OK;
            ctx.response.body = {
                message: `Category with deleted successfully.`
            }
        } else {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: `Category has not been found.`
            }
        }
    }

    /**
     * Updates category
     * @param ctx 
     * @returns 
     */
    public async updateCategory(ctx: RouterContext<string>){
        const { categoryId } = ctx.params;

        if (Number(categoryId) >= 0 && Number(categoryId) <= 11) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = {
                message: "Cannot update default categories"
            };
            return;
        }

        const updates = await ctx.request.body.json();

        const userId = await ctx.cookies.get("user_id");

        if (!updates) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = {
                message: "No updates provided."
            };
            return;
        }

        try {
            const updatedCategory = await this.categoryService.udpateCategory(Number(categoryId), userId!, updates);

            if (!updatedCategory) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = {message: "No category updated."};
                return;
            }

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Category updated successfully",
                category: updatedCategory
            }
        } catch (error) {
            if (error instanceof NotFoundError) {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = {message: "Category with provided id was not found."}
            } else if (error instanceof UnauthorizedError) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = {message: "Unauthorized edit."}
            } else {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = {message: error}
            }
        }
    }
}