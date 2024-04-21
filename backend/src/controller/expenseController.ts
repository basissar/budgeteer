import { RouterContext } from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { CREATED, INTERNAL_ERROR, WALLET_SERVICE, EXPENSE_SERVICE, USER_SERVICE, OK, NOT_FOUND } from "../config/macros.ts";
import { container } from "../container.ts";
import { Expense } from "../model/Expense.ts";
import { ExpenseService } from "../service/expenseService.ts";
import { WalletService } from "../service/walletService.ts";
import { UserService } from '../service/userService.ts';
import { BAD_REQUEST } from '../config/macros.ts';
import { UNAUTHORIZED } from '../config/macros.ts';

export class ExpenseController {
    public expenseService: ExpenseService;

    public walletService: WalletService;

    public userService: UserService;

    constructor() {
        const expenseSer = container.resolve(EXPENSE_SERVICE);
        const walletSer = container.resolve(WALLET_SERVICE);
        const userSer = container.resolve(USER_SERVICE);

        if (expenseSer == null) {
            const newExpenseSer = new ExpenseService();
            container.register(EXPENSE_SERVICE, newExpenseSer);
            this.expenseService = newExpenseSer;
        } else {
            this.expenseService = expenseSer;
        }

        if (walletSer == null) {
            const newWalletSer = new WalletService();
            container.register(WALLET_SERVICE, newWalletSer);
            this.walletService = newWalletSer;
        } else {
            this.walletService = walletSer;
        }

        if (userSer == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = userSer;
        }
    }

    async createExpense(ctx: RouterContext<string>) {
        try {
            const requestBody = await ctx.request.body().value;

            const passedExpense = requestBody.valueOf();

            const newExpense = new Expense(passedExpense);

            const createdExpense = await this.expenseService.createExpense(newExpense);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Expense created successfully",
                expense: createdExpense
            }

        } catch (error) {
            ctx.response.status = INTERNAL_ERROR,
                ctx.response.body = { message: error.message };
        }
    }

    //TODO when returning expenses for wallet that does not exist i should not check for wallet existence here
    //instead do it in service or data layer and return null instead 
    async getExpensesForWallet(ctx: RouterContext<string>) {
        try {
            const { userId, walletId } = ctx.params;

            const userExists = await this.userService.exists(userId);

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `User with id: ${userId} does not exist` };
                return;
            }

            const walletExists = await this.walletService.exists(walletId);

            if (!walletExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `Wallet with id: ${walletId} does not exist` };
                return;
            }

            const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            if (!belongsToUser) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
                return;
            }

            const expenses = await this.expenseService.findByWallet(walletId, userId);

            ctx.response.status = OK;
            ctx.response.body = {
                message: `Expenses for wallet with id: ${walletId} retrieved`,
                expenses: expenses
            }
        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { messasge: error.message };
        }
    }

    async getAllForUser(ctx: RouterContext<string>) {
        try {
            const { userId } = ctx.params;

            const userExists = await this.userService.exists(userId);

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `User with id: ${userId} does not exist` };
                return;
            }
            
            const expenses = await this.expenseService.findByUser(userId);

            ctx.response.status = OK;
            ctx.response.body = {
                message: `All expenses for user retrieved`,
                expenses: expenses
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR,
            ctx.response.body = {message: err.message}
        }
    }

    async deleteExpense(ctx: RouterContext<string>) {
        try {
            const { userId, walletId, expenseId } = ctx.params;

            const userExists = await this.userService.exists(userId);

            if (!userExists) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: `User with id: ${userId} does not exist` };
                return;
            }

            //we don't neccessarily need to check for wallet and expense existence since we are passing it from frontend directly

            const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            if (!belongsToUser) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
                return;
            }

            const deleted = await this.expenseService.deleteExpense(Number(expenseId));

            if (deleted) {
                ctx.response.status = OK;
                ctx.response.body = {
                    message: `Expense with deleted successfully.`
                }
            } else {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = {
                    message: `Expense has not been found.`
                }
            }
        } catch (error) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: error.message };
        }
    }
}