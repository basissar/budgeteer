import { RouterContext } from "https://deno.land/x/oak@v12.6.1/router.ts";
import { CREATED, INTERNAL_ERROR, NO_CONTENT, OK, SAVINGS_SERVICE, UNAUTHORIZED, USER_SERVICE, WALLET_SERVICE } from "../config/macros.ts";
import { GoalService } from "../service/goalService.ts";
import { UserService } from "../service/userService.ts";
import { WalletService } from "../service/walletService.ts";
import { container } from "../utils/container.ts";
import { Goal } from "../model/Goal.ts";


export class GoalController {
    private goalService: GoalService;

    private walletService: WalletService;

    private userService: UserService;

    constructor(){
        const goalSer = container.resolve(SAVINGS_SERVICE);
        const walletSer = container.resolve(WALLET_SERVICE);
        const userSer = container.resolve(USER_SERVICE);

        if (goalSer == null) {
            const newGoalSer = new GoalService();
            container.register(SAVINGS_SERVICE, newGoalSer);
            this.goalService = newGoalSer;
        } else {
            this.goalService = goalSer;
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


    async createGoal(ctx: RouterContext<string>){
        try {
            const requestBody = await ctx.request.body().value;

            const passedGoal = requestBody.valueOf();

            const newGoal = new Goal(passedGoal);

            const createdGoal = await this.goalService.createGoal(newGoal);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Goal created successfully",
                goal: createdGoal
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = {message: err.message};
        }
    }

    async getGoalsForWallet(ctx: RouterContext<string>){
        try {
            const { userId, walletId } = ctx.params;

            const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            if (!belongsToUser) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
                return;
            }

            const goals = await this.goalService.findByWallet(walletId, userId);

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Goals retrieved successfully",
                goals: goals
            }
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message}
        }
    }

    async deleteGoal(ctx: RouterContext<string>){
        try {
            const { goalId } = ctx.params;

            await this.goalService.deleteGoal(Number(goalId));

            ctx.response.status = NO_CONTENT;
        } catch (err) {
            ctx.response.status = INTERNAL_ERROR;
            ctx.response.body = { message: err.message}
        }
    }
}