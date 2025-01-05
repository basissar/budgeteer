import { RouterContext } from "@oak/oak";
import {
    BAD_REQUEST,
    CREATED,
    GREEN,
    NOT_FOUND,
    OK,
    RED,
    RESET_COLOR,
    UNAUTHORIZED
} from "../config/macros.ts";
import { GoalService } from "../service/goalService.ts";
import { WalletService } from "../service/walletService.ts";
import { Goal } from "../model/Goal.ts";
import { ValidationError } from "../errors/ValidationError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";


export class GoalController {
    private goalService: GoalService;

    private walletService: WalletService;

    constructor(goalService: GoalService, walletService: WalletService) {
        this.goalService = goalService;
        this.walletService = walletService;
    }

    /**
     * Creates goal
     * @param ctx 
     */
    public async createGoal(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const userId = await ctx.cookies.get("user_id");

        const newGoal = new Goal(requestBody);

        try {
            const serviceResponse = await this.goalService.createGoal(newGoal, userId!);

            ctx.response.status = CREATED;
            ctx.response.body = {
                message: "Goal created successfully",
                goal: serviceResponse.goal,
                eventResult: serviceResponse.eventResult
            }
        } catch (error) {
            if (error instanceof ValidationError) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = {
                    message: error.message
                }
            }
        }
    }

    /**
     * Updates money in a goal
     * @param ctx 
     */
    public async updateMoney(ctx: RouterContext<string>) {
        const requestBody = await ctx.request.body.json();

        const { goalId } = ctx.params;

        const userId = await ctx.cookies.get("user_id");

        const serviceResponse = await this.goalService.updateMoney(Number(goalId), Number(requestBody.amount), userId!);

        ctx.response.status = OK;

        if (serviceResponse instanceof Goal) {
            ctx.response.body = {
                message: "Money in savings goal updated",
                goal: serviceResponse,
            }
        } else {
            ctx.response.body = {
                message: "Money in savings goal updated",
                goal: serviceResponse.goal,
                eventResult: serviceResponse.eventResult,
                additionalMessage: serviceResponse.additionalMessage ?? serviceResponse.completeMessage, // Choose based on availability
            }
        }
    }

    /**
     * Manual goal completion
     * @param ctx 
     * @returns 
     */
    public async completeGoal(ctx: RouterContext<string>) {
        const { userId, goalId } = ctx.params;

        const completedGoal = await this.goalService.completeGoal(Number(goalId), userId);

        if (!completedGoal) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: `No goal to be completed was found`,
            }
            return;
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: `Goal was completed successfully`
        }
    }

    /**
     * Retrieves specific goal
     * @param ctx 
     */
    public async getGoal(ctx: RouterContext<string>){
        const { goalId } = ctx.params;

        const userId = await ctx.cookies.get("user_id");

        const goal = await this.goalService.getGoal(Number(goalId), userId!);
        
        ctx.response.status = OK;

        ctx.response.body = {
            message: "Goal retrieved",
            goal: goal
        }

    }

    /**
     * Retrieves goals for specific wallet
     * @param ctx 
     * @returns 
     */
    public async getGoalsForWallet(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const userId = await ctx.cookies.get("user_id");

        const belongsToUser = await this.walletService.belongsToUser(userId!, walletId);

        if (!belongsToUser) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: `User with id: ${userId} is not authorized to access wallet with id: ${walletId}` };
            return;
        }

        const goals = await this.goalService.findByWallet(walletId, userId!);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Goals retrieved successfully",
            goals: goals
        }
    }

    /**
     * Deletes goal
     * @param ctx 
     */
    public async deleteGoal(ctx: RouterContext<string>) {
        const { goalId } = ctx.params;

        const deletedGoal = await this.goalService.deleteGoal(Number(goalId));

        if (deletedGoal) {
            ctx.response.status = OK;
            ctx.response.body = { message: "Goal deleted successfully" }
        } else {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "No goal deleted" }
        }
    }

    /**
     * Updates wallet
     * @param ctx 
     * @returns 
     */
    public async updateGoal(ctx: RouterContext<string>) {
        const { goalId } = ctx.params;

        const userId = await ctx.cookies.get("user_id");

        if (!userId) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: "Unauthorized access to goal edit." }
            return
        }

        const updates = await ctx.request.body.json();

        if (!updates || Object.keys(updates).length === 0) {
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "No updates provided." };
            return;
        }

        try {
            const updatedGoal = await this.goalService.updateGoal(userId!, Number(goalId), updates);

            if (!updatedGoal) {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = { message: "Goal not found or could not be updated." };
                return;
            }

            ctx.response.status = OK;
            ctx.response.body = {
                message: "Goal updated successfully.",
                goal: updatedGoal,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                ctx.response.status = BAD_REQUEST;
                ctx.response.body = { message: error.message };
            } else if (error instanceof NotFoundError) {
                ctx.response.status = NOT_FOUND;
                ctx.response.body = { message: error.message };
            } else {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: (error as Error).message };
            }
        }
    }
}