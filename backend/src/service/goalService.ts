import { ACCOUNT_SERVICE, ACHIEVEMENT_SERVICE, GREEN, RED, RESET_COLOR, WALLET_SERVICE } from "../config/macros.ts";
import { GoalRepository } from "../repository/goalRepository.ts";
import { container } from "../utils/container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Goal } from "../model/Goal.ts";
import { WalletService } from "./walletService.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { AccountService } from "./accountService.ts";
import { EventType } from "../model/EventType.ts";
import { AchievementService } from "./achievementService.ts";
import { AchievementType } from "../model/AchievementType.ts";
import { ValidationError } from "../errors/ValidationError.ts";
import { EventResult } from "../model/EventResult.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";

interface GoalResponse {
    eventResult?: EventResult | null;
    goal: Goal;
    completeMessage?: string;
    additionalMessage?: string;
}

export class GoalService {
    private goalRepository: GoalRepository;

    private walletService: WalletService;

    private accountService: AccountService;

    private achievementService: AchievementService;

    constructor(goalRepository: GoalRepository,
        walletService: WalletService,
        accountService: AccountService,
        achievementService: AchievementService
    ) {
        this.goalRepository = goalRepository;
        this.walletService = walletService;
        this.accountService = accountService;
        this.achievementService = achievementService;
    }


    /**
     * Creates a new goal
     * @param goal to create
     * @param userId 
     * @returns 
     */
    public async createGoal(goal: Goal, userId: string) {
        if (goal.targetAmount <= 0 || goal.currentAmount < 0) {
            throw new ValidationError(`Goal amounts cannot be in negative values`);
        }

        try {
            const exists = await this.goalRepository.exists(goal.id);

            if (exists) {
                throw new DuplicateError(`Goal with id: ${goal.id} already exists`);
            }

            const createdGoal = await this.goalRepository.save(goal);

            const eventResult = await this.accountService.handleEvent(EventType.CREATE_GOAL, userId);

            const toReturn = await this.goalRepository.findById(createdGoal!.id);

            const finalResponse = {
                eventResult: eventResult,
                goal: toReturn
            }

            return finalResponse;
        } catch (error) {
            throw new ServiceError(`Savings service error: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves goal by selected id
     * @param id goal id we want to retrieve
     * @param userId id of user for ownership chesk
     */
    public async getGoal(id: number, userId: string) {
        let foundGoal;

        try {
            foundGoal = await this.goalRepository.findById(id);

            console.log(foundGoal);
        } catch (error) {
            throw new ServiceError(`Savings service error: ${(error as Error).message}`);
        }

        if (!foundGoal) {
            throw new NotFoundError(`Goal with provided id not found.`);
        }

        const belongsToUser = await this.walletService.belongsToUser(userId, foundGoal?.walletId);

        if (!belongsToUser) {
            throw new UnauthorizedError(`Unauthorized access to goal retrieval`);
        }

        return foundGoal;
    }

    /**
     * Retrieves all goals for specific wallet
     * @param walletId id of said wallet
     * @param userId used for ownership check
     * @returns 
     */
    public async findByWallet(walletId: string, userId: string) {
        try {
            const foundWallet = await this.walletService.getWallet(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            const belongsToUser = await this.walletService.belongsToUser(userId, foundWallet.walletId)

            const foundGoals = await this.goalRepository.findByWallet(walletId);
            return foundGoals;
        } catch (error) {
            throw new ServiceError(`Savings Service error: ${(error as Error).message}`);
        }
    }

    /**
     * Same as budgets -> returns true if user achieved the target goal, else false
     * @param toUpdate goal to be updated
     * @param amount amount of added money
     * @returns 
     */
    async updateMoney(goalId: number, amount: number, userId: string): Promise<GoalResponse | Goal> {

        try {
            const foundGoal = await this.goalRepository.findById(goalId);

            if (foundGoal == null) {
                throw new NotFoundError(`Goal with id ${goalId} was not found and cannto be updated`);
            }

            let amountToUpdate = foundGoal.currentAmount + amount;

            if (amountToUpdate < 0) {
                amountToUpdate = 0;
            }

            const updatedGoalData: Partial<Goal> = {
                currentAmount: amountToUpdate
            };

            const updatedGoal = await this.goalRepository.update(goalId, updatedGoalData);

            if (updatedGoal == null) {
                throw new ServiceError(`Savings Service error: error updating goal amount`);
            }

            const newAmount = updatedGoal.currentAmount;
            const target = updatedGoal.targetAmount;

            const reachedTarget = newAmount >= target;

            if (reachedTarget && updatedGoal.completed) {
                return {
                    eventResult: null,
                    goal: updatedGoal,
                    additionalMessage: "No XP or credits will be awarded. You've already reached your target at one point. ",
                };
            }

            //We are only handling the completion event the first time goal is completed
            if (reachedTarget && !updatedGoal.completed) {
                const eventResult = await this.accountService.handleEvent(EventType.REACH_GOAL, userId);

                await this.completeGoal(updatedGoal.id, userId);

                const completedGoal = await this.goalRepository.findById(updatedGoal.id);

                const finalResponse = {
                    eventResult: eventResult,
                    goal: completedGoal!,
                    completeMessage: "You completed your goal! You can still add money to save up more! Or deduct if something went south."
                }

                return finalResponse;
            } else {
                return updatedGoal;
            }

        } catch (err) {
            throw new ServiceError(`Savings service error: ${(err as Error).message}`);
        }
    }

    /**
     * Sets the goal as completed and evaluates achievement
     * @param goalId id of goal to be completed
     * @param userId 
     * @returns 
     */
    public async completeGoal(goalId: number, userId: string) {
        const foundGoal = await this.goalRepository.findById(goalId);

        if (foundGoal == null) {
            return false;
        }

        foundGoal.set('completed', true);
        foundGoal.save();

        const completed = await this.goalRepository.countCompleted(userId);
        const account = await this.accountService.getIdForUser(userId);

        console.log(completed);

        await this.achievementService.evaluateAchievement(account?.id, AchievementType.GOAL, [this.goalRepository, completed]);
        return true;
    }

    /**
     * Updates goal with provided information
     * @param userId used for update authorization
     * @param goalId id of goal we want to update
     * @param updates object with wanted updates
     * @returns 
     */
    public async updateGoal(userId: string, goalId: number, updates: Partial<Goal>) {
        const goal = await this.goalRepository.findById(goalId);

        if (!goal) {
            throw new NotFoundError(`Wallet with id ${goal} does not exist.`);
        }

        const belongsToUser = await this.walletService.belongsToUser(userId, goal.walletId)

        if (!belongsToUser) {
            throw new ServiceError(`Unauthorized to update goal.`);
        }

        if (updates.targetAmount! <= goal.targetAmount || updates.targetAmount === 0) {
                throw new ValidationError(`New target amount must be higher than current target amount and 0.`);
        }

        return await this.goalRepository.update(goalId, updates);
    }

    /**
     * Deletes goal
     * @param goalId id of goal to be deleted 
     * @returns 
     */
    public async deleteGoal(goalId: number) {
        try {
            const foundGoal = await this.goalRepository.exists(goalId);

            if (!foundGoal) {
                return false;
            }

            const deletedRows = await this.goalRepository.deleteById(goalId);
            return deletedRows != 0;
        } catch (error) {
            throw new ServiceError(`Savings service error: ${(error as Error).message}`);
        }
    }
}