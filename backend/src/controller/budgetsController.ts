import { RouterContext } from "@oak/oak";
import { BUDGET_SERVICE, CREATED, EXPENSE_SERVICE, NO_CONTENT, INTERNAL_ERROR, OK, UNAUTHORIZED, USER_SERVICE, WALLET_SERVICE, NOT_FOUND } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { BudgetService } from "../service/budgetService.ts";
import { ExpenseService } from "../service/expenseService.ts";
import { UserService } from "../service/userService.ts";
import { WalletService } from "../service/walletService.ts";
import { Budget } from "../model/Budget.ts";

export class BudgetController {
    public budgetService: BudgetService;

    public userService: UserService;

    public walletService: WalletService;

    public expenseService: ExpenseService;

    constructor(budgetService: BudgetService, userService: UserService, walletService: WalletService, expenseService: ExpenseService){
        this.budgetService = budgetService;
        this.userService = userService;
        this.walletService = walletService;
        this.expenseService = expenseService;
    }


    async createBudget(ctx: RouterContext<string>) {
            const requestBody = await ctx.request.body.json();

            const { userId } = ctx.params;

            const newBudget = new Budget(requestBody);

            const serviceResponse = await this.budgetService.createBudget(userId, newBudget);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Budget created successfully",
                budget: serviceResponse?.budget,
                eventResult: serviceResponse?.eventResult
            }
    }

    async getBudgetsForWallet(ctx: RouterContext<string>) {
            const { userId, walletId } = ctx.params;

            const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            if (!belongsToUser) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
                return;
            }

            const budgets = await this.budgetService.findByWallet(walletId);

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Budgets retrieved successfully",
                budgets: budgets,
            }
    }

    async deleteBudget(ctx: RouterContext<string>){
            const { userId, walletId, budgetId} = ctx.params;

            const deleted = await this.budgetService.deleteBudget(Number(budgetId));

            if (deleted) {
                ctx.response.status = OK;
                ctx.response.body = { message: 'Budget deleted'};
            } else {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = { message: 'No budget was deleted'};
            }
    }

    // async updateBudget(ctx: RouterContext<string>){
    //     try {
    //         const { userId, walletId, budgetId } = ctx.params;

    //         const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

    //         if (!belongsToUser) {
    //             ctx.response.status = UNAUTHORIZED;
    //             ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
    //             return;
    //         }

    //         const requestBody = await ctx.request.body().value;

    //         const passedBody = requestBody.valueOf();

    //         if (passedBody.amountOnly == true){
    //             const overLimit = await this.budgetService.updateMoney(,passedBody.amount)
                
    //             //todo implement over limit handling of budgets

    //             /*
    //             This whole clause might be useless because only time I update budget is when adding expenses
    //             */
            
    //         }



    //     } catch (error) {
    //         ctx.response.status = INTERNAL_ERROR;
    //         ctx.response.body = { message: error.message };
    //     }
    // }
}