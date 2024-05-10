import { SAVINGS_REPOSITORY, WALLET_SERVICE } from "../config/macros.ts";
import { GoalRepository } from "../repository/goalRepository.ts";
import { container } from "../utils/container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Goal } from "../model/Goal.ts";
import { WalletService } from "./walletService.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";

export class GoalService {
    private goalRepository: GoalRepository;

    private walletService: WalletService;

    constructor(){
        const goalRepo = container.resolve(SAVINGS_REPOSITORY);
        const walletSer = container.resolve(WALLET_SERVICE);

        if (goalRepo == null){
            const newGoalRepo = new GoalRepository();
            container.register(SAVINGS_REPOSITORY, newGoalRepo);
            this.goalRepository = newGoalRepo;
        } else {
            this.goalRepository = goalRepo;
        }

        if (walletSer == null){
            const newWalletSer = new WalletService();
            container.register(WALLET_SERVICE, newWalletSer);
            this.walletService= newWalletSer;
        } else {
            this.walletService = walletSer;
        }
    }


    async createGoal(goal: Goal){
        try {
            const exists = await this.goalRepository.exists(goal.id);

            if (exists) {
                throw new DuplicateError(`Goal with id: ${goal.id} already exists`);
            }

            const createdGoal = await this.goalRepository.save(goal);

            return createdGoal;
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
    async updateMoney(toUpdate: Goal, amount: number){
        try {
            toUpdate.set({
                currentAmount: toUpdate.currentAmount + amount,
            });

            const savedGoal = await this.goalRepository.save(toUpdate);

            if (savedGoal != null) {
                const newAmount = savedGoal.currentAmount;
                const target = savedGoal.targetAmount;

                return newAmount >= target;
            } else {
                throw new ServiceError(`Savings Service error: error updating goal amount`);
            }
        } catch (err) {
            throw new ServiceError(`Savings service error: ${err.message}`);
        }
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