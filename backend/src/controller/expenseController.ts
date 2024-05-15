import { RouterContext } from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { CREATED, INTERNAL_ERROR, WALLET_SERVICE, EXPENSE_SERVICE, USER_SERVICE, OK, NOT_FOUND } from "../config/macros.ts";
import { container } from "../utils/container.ts";
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
        const requestBody = await ctx.request.body().value;

        const { userId } = ctx.params;

        const passedExpense = requestBody.valueOf();

        const newExpense = new Expense(passedExpense);

        const serviceResponse = await this.expenseService.createExpense(newExpense, userId);

        ctx.response.status = CREATED;
        ctx.response.body = {
            message: "Expense created successfully",
            expense: serviceResponse.expense,
            eventResult: serviceResponse.eventResult
        }
    }

    async getExpensesForWallet(ctx: RouterContext<string>) {
        const { userId, walletId } = ctx.params;

        const expenses = await this.expenseService.findByWallet(walletId, userId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: `Expenses for wallet with id: ${walletId} retrieved`,
            expenses: expenses
        }
    }

    async getAllForUser(ctx: RouterContext<string>) {
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
    }

    async deleteExpense(ctx: RouterContext<string>) {
        const { userId, walletId, expenseId } = ctx.params;

        const userExists = await this.userService.exists(userId);

        if (!userExists) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: `User with id: ${userId} does not exist` };
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
    }
}