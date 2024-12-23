import { ACCOUNT_SERVICE, ACHIEVEMENT_SERVICE, WALLET_SERVICE } from "../config/macros.ts";
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

export class GoalService {
    private goalRepository: GoalRepository;

    private walletService: WalletService;

    private accountService: AccountService;

    private achievementService: AchievementService;

    constructor(goalRepository: GoalRepository,
        walletService: WalletService,
        accountService: AccountService,
        achievementService: AchievementService
    ){
        this.goalRepository = goalRepository;
        this.walletService = walletService;
        this.accountService = accountService;
        this.achievementService = achievementService;
    }


    async createGoal(goal: Goal, userId: string){
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
            throw new ServiceError(`Savings service error: ${error.message}`);
        }
    }

    async findById(id: number){
        try {
            return await this.goalRepository.findById(id);
        } catch (error) {
            throw new ServiceError(`Savings service error: ${error.message}`);
        }
    }

    async findByWallet(walletId: string, userId: string){
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId != userId){
                return null;
            }

            const foundGoals = await this.goalRepository.findByWallet(walletId);
            return foundGoals;
        } catch (error) {
            throw new ServiceError(`Savings Service error: ${error.message}`);
        }
    }

    /**
     * Same as budgets -> returns true if user achieved the target goal, else false
     * @param toUpdate goal to be updated
     * @param amount amount of added money
     * @returns 
     */
    async updateMoney(goalId: number, amount: number, userId: string){
        try {
            const foundGoal = await this.goalRepository.findById(goalId);

            if (foundGoal == null){
                throw new NotFoundError(`Goal with id ${goalId} was not found and cannto be updated`);
            }

            foundGoal.set({
                currentAmount: foundGoal.currentAmount + amount,
            });

            const savedGoal = await this.goalRepository.save(foundGoal);

            if (savedGoal == null) {
                throw new ServiceError(`Savings Service error: error updating goal amount`);
            }

            const newAmount = savedGoal.currentAmount;
            const target = savedGoal.targetAmount;

            const reachedTarget = newAmount >= target;

            if (reachedTarget) {
                const eventResult = await this.accountService.handleEvent(EventType.REACH_GOAL, userId);

                const finalResponse = {
                    eventResult: eventResult,
                    goal: savedGoal,
                    completeMessage: "Mark the goal as completed?" 
                    //TODO finish the return complete goal message
                }

                return finalResponse;
            } else {
                return savedGoal;
            }

        } catch (err) {
            throw new ServiceError(`Savings service error: ${err.message}`);
        }
    }

    async completeGoal(goalId: number, userId: string) {
        const foundGoal = await this.findById(goalId);

        if (foundGoal == null){
            return false;
        }

        foundGoal.set('completed', true);
        foundGoal.save();

        const completed = await this.goalRepository.countCompleted(userId);
        const account = await this.accountService.getIdForUser(userId);

        await this.achievementService.evaluateAchievement(account?.id, AchievementType.GOAL, [this.goalRepository, completed]);
        return true;
    }

    async updateGoal(goal: Goal){
        try {
            const exists = await this.goalRepository.exists(goal.id);

            if (!exists) {
                throw new NotFoundError(`Goal ${goal.id} not found`);
            }

            return await this.goalRepository.save(goal);
        } catch (err) {
            throw new ServiceError(`Savings service error: ${err.message}`);
        }
    }

    async deleteGoal(goalId: number){
        try {
            const foundGoal = await this.goalRepository.exists(goalId);

            if (!foundGoal) {
                return false;
            }

            const deletedRows = await this.goalRepository.deleteById(goalId);
            return deletedRows != 0;
        } catch (error) {
            throw new ServiceError(`Savings service error: ${error.message}`);
        }
    }
}