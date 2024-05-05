import { BUDGET_REPOSITORY, WALLET_REPOSITORY } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { BudgetRepository } from "../repository/budgetRepository.ts";
import { Budget } from "../model/Budget.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { WalletRepository } from "../repository/walletRepository.ts";

export class BudgetService {
    public budgetRepository: BudgetRepository;

    public walletRepository: WalletRepository;

    constructor() {
        const budgetRepo = container.resolve(BUDGET_REPOSITORY);
        const walletRepo = container.resolve(WALLET_REPOSITORY);

        if (budgetRepo == null) {
            const newBudgetRepo = new BudgetRepository();
            container.register(BUDGET_REPOSITORY, newBudgetRepo);
            this.budgetRepository = newBudgetRepo;
        } else {
            this.budgetRepository = budgetRepo;
        }

        if (walletRepo == null) {
            const newWalletRepo = new WalletRepository();
            container.register(WALLET_REPOSITORY, newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }
    }

    async createBudget(budget: Budget){
        try {
            const exists = await this.budgetRepository.exists(budget.id);

            if (exists) {
                throw new DuplicateError(`Budget with id: ${budget.id} already exists`);
            }

            return await this.budgetRepository.save(budget);
        } catch (error) {
            throw new ServiceError(`Budget service error: ${error.message}`);
        }
    }

    async updateBudget(budget: Budget){
        try {
            const exists = await this.budgetRepository.exists(budget.id);

            if(!exists) {
                throw new NotFoundError(`Budget with id: ${budget.id} does not exist and thus cannot be updated`);
            }

            return await this.budgetRepository.save(budget);
        }  catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async findByWallet(walletId: string){
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (!foundWallet) {
                return null;
            }

            const foundBudgets = await this.budgetRepository.findByWallet(walletId);

            return foundBudgets;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async findByWalletAndCategory(walletId: string, categoryId: number) {
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (!foundWallet) {
                return null;
            }

            const foundBudgets = await this.budgetRepository.findByWalletAndCategory(walletId, categoryId);

            return foundBudgets;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async deleteBudget(budgetId: number) {
        try {
            const foundBudget = await this.budgetRepository.exists(budgetId);

            if (!foundBudget) {
                //todo throwing error vs returning false
                throw new NotFoundError(`Budget ${budgetId} not found`);
            }

            const deletedRows = await this.budgetRepository.deleteById(budgetId);

            return deletedRows != 0;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`)
        }
    }

    /**
     * Returns true if user went over the limit, else false
     * @param budgetId id of budget that we are updating
     * @param amount amount of added money
     */
    async updateMoney(toUpdate: Budget, amount: number): Promise<boolean>{
        try {
            toUpdate.set({
                currentAmount: toUpdate.currentAmount + amount,
            });

            const savedBudget = await this.budgetRepository.save(toUpdate);

            if (savedBudget != null) {
                const newAmount = savedBudget.currentAmount;
                const limit = savedBudget.limit;

                if (newAmount >= limit) {
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new ServiceError(`Budget error: error updating budget amount`);
            }

        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async resetBudget(budgetId: number) {
        try {
            const foundBudget = await this.budgetRepository.findById(budgetId);

            if (!foundBudget) {
                //todo throwing error vs returning false
                throw new NotFoundError(`Budget ${budgetId} not found`);
            }

            foundBudget.set({
                currentAmount: 0,
            });

            const savedBudget = await this.budgetRepository.save(foundBudget);
            
            if (savedBudget != null) {
                return true;
            } else {
                throw new ServiceError(`Budget service error: error reseting budget`);
            }

        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }
}