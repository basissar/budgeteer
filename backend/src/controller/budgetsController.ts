import { RouterContext } from "https://deno.land/x/oak@v12.6.1/router.ts";
import { BUDGET_SERVICE, CREATED, EXPENSE_SERVICE, NO_CONTENT, INTERNAL_ERROR, OK, UNAUTHORIZED, USER_SERVICE, WALLET_SERVICE } from "../config/macros.ts";
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

    constructor(){
        const budgetSer = container.resolve(BUDGET_SERVICE);
        const userSer = container.resolve(USER_SERVICE);
        const walletSer = container.resolve(WALLET_SERVICE);
        const expenseSer = container.resolve(EXPENSE_SERVICE);

        if (budgetSer == null) {
            const newBudgetSer = new BudgetService();
            container.register(BUDGET_SERVICE, newBudgetSer);
            this.budgetService = newBudgetSer;
        } else {
            this.budgetService = budgetSer;
        }

        if (userSer == null) {
            const newUserService = new UserService();
            container.register(USER_SERVICE, newUserService);
            this.userService = newUserService;
        } else {
            this.userService = userSer;
        }

        if (walletSer == null) {
            const newWalletService = new WalletService();
            container.register(WALLET_SERVICE, newWalletService);
            this.walletService = newWalletService;
        } else {
            this.walletService = walletSer;
        }

        if (expenseSer == null) {
            const newExpenseService = new ExpenseService();
            container.register(EXPENSE_SERVICE, newExpenseService);
            this.expenseService = newExpenseService;
        } else {
            this.expenseService = expenseSer;
        }
    }


    async createBudget(ctx: RouterContext<string>) {
        try {
            const requestBody = await ctx.request.body().value;

            const passedBudget = requestBody.valueOf();

            const newBudget = new Budget(passedBudget);

            const createdBudget = await this.budgetService.createBudget(newBudget);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Budget created successfully",
                budget: createdBudget
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = {message: err.message};
        }
    }

    async getBudgetsForWallet(ctx: RouterContext<string>) {
        try {
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
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message };
        }
    }

    async deleteBudget(ctx: RouterContext<string>){
        try {
            const { userId, walletId, budgetId} = ctx.params;

            // const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            // if (!belongsToUser) {
            //     ctx.response.status = UNAUTHORIZED;
            //     ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
            //     return;
            // }

            const deleted = await this.budgetService.deleteBudget(Number(budgetId));

            // if (deleted) {
            //     ctx.response.body = { message: `Budget deletec successfully`}
            // } else {
            //     ctx.response.body = { message: `No budgets were deleted`}
            // }

            ctx.response.status = NO_CONTENT;
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message}
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