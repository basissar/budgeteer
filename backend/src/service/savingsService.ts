import { SAVINGS_REPOSITORY, WALLET_REPOSITORY } from "../config/macros.ts";
import { container } from "../container.ts";
import { WalletRepository } from "../repository/walletRepository.ts";
import { SavingsRepository } from "../repository/savingsRepository.ts";
import { Goal } from "../model/Goal.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";

export class SavingsService {
    public savingsRepository: SavingsRepository;

    public walletRepository: WalletRepository;

    constructor() {
        const savingsRepo = container.resolve(SAVINGS_REPOSITORY);
        const walletRepo = container.resolve(WALLET_REPOSITORY);
        
        if (savingsRepo == null){
            const newSavingsRepo = new SavingsRepository();
            container.register(SAVINGS_REPOSITORY, newSavingsRepo);
            this.savingsRepository = newSavingsRepo;
        } else {
            this.savingsRepository = savingsRepo;
        }

        if (walletRepo == null){
            const newWalletRepo = new WalletRepository();
            container.register(WALLET_REPOSITORY, newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }
    }

    async createGoal(goal: Goal) {
        try {
            const exists = await this.savingsRepository.exists(goal.id);

            if (exists) {
                throw new DuplicateError(`Goal with id: ${goal.id} already exists`);
            }

            return await this.savingsRepository.save(goal);
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }

    async updateGoal(goal: Goal){
        try {
            const exists = await this.savingsRepository.exists(goal.id);

            if(!exists) {
                throw new NotFoundError(`Goal with id: ${goal.id} does not exist and cannot be updated`);
            }

            return await this.savingsRepository.save(goal);
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }

    async findByWallet(walletId: string){
        try {
            const walletExists = await this.walletRepository.exists(walletId);

            if (!walletExists) {
                return null;
            }
            
            const foundGoals = await this.savingsRepository.findByWallet(walletId);

            return foundGoals;
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }

    async deleteGoal(goalId: number){
        try {
            const goalExists = await this.savingsRepository.exists(goalId);

            if (!goalExists) {
                throw new NotFoundError(`Goal ${goalId} not found`);
            }

            const deletedRows = await this.savingsRepository.deleteById(goalId);
        
            return deletedRows != 0;
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }

    async updateMoney(goalId: number, amount: number) {
        try {
            const foundGoal = await this.savingsRepository.findById(goalId);

            if (!foundGoal) {
                throw new NotFoundError(`Goal ${goalId} not found`);
            }

            foundGoal.set({
                currentAmount: foundGoal.currentAmount + amount,
            });

            const savedGoal = await this.savingsRepository.save(foundGoal);

            if (savedGoal != null) {
                const newAmount = savedGoal.currentAmount;
                const target = savedGoal.targetAmount;

                if (newAmount >= target) {
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new ServiceError(`Goal service error: error updating goal`);
            }
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }

    async checkDeadline(goalId: number) {
        try {
            const foundGoal = await this.savingsRepository.findById(goalId);

            if (!foundGoal) {
                throw new NotFoundError(`Goal ${goalId} not found`);
            }

            const deadline = foundGoal.deadline;
            const today = new Date();

            if (deadline.getTime() > today.getTime()) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            throw new ServiceError(`Goal service error: ${err.message}`);
        }
    }
}