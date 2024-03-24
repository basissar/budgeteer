import { container } from "../container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { Expense } from "../model/Expense.ts";
import { ExpenseRepository } from "../repository/expenseRepo.ts";
import { WalletRepository } from "../repository/walletRepo.ts";

export class ExpenseService {
    
    public expenseRepository: ExpenseRepository;

    public walletRepository: WalletRepository;

    constructor() {
        const expRepo = container.resolve('ExpenseRepository');
        const walletRepo = container.resolve('WalletRepository');

        if (expRepo === null) {
            const newExpRepo = new ExpenseRepository();
            container.register('ExpenseRepository', newExpRepo);
            this.expenseRepository = newExpRepo;
        } else {
            this.expenseRepository = expRepo;
        }

        if (walletRepo === null) {
            const newWalletRepo = new WalletRepository();
            container.register('WalletRepository', newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }
    }

    async createExpense(expense: Expense) {
        try {
            const exists = await this.exists(expense.id);

            if (exists){
                throw new DuplicateError(`Expense with id ${expense.id} already exists`);
            }

            return await this.expenseRepository.save(expense);
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async exists(id: number){
        try {
            return await this.expenseRepository.exists(id);
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async findById(id: number){
        try {
            return await this.expenseRepository.findById(id);
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async findByWallet(walletId: string, userId: string){
        try {
            const wallet = await this.walletRepository.findById(walletId);

            if (!wallet) {
                throw new NotFoundError(`Wallet with identifier ${walletId} does not exist`);
            }

            //optional ownership check
            if (wallet.userId !== userId) {
                throw new UnauthorizedError(`User does not have permission to access expenses for this wallet`);
            }

            const foundExpenses = await this.expenseRepository.findByWallet(walletId);
            return foundExpenses;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

}