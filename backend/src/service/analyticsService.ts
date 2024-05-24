import { CATEGORY_REPOSITORY, EXPENSE_REPOSITORY, RED, RESET_COLOR } from "../config/macros.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { container } from "../utils/container.ts";


export class AnalyticsService {

    private expenseRepository: ExpenseRepository;

    private categoryRepository: CategoryRepository;

    constructor() {
        this.expenseRepository = container.resolve(EXPENSE_REPOSITORY);
        this.categoryRepository = container.resolve(CATEGORY_REPOSITORY);

        if (this.expenseRepository == null) {
            const newExpenseRepo = new ExpenseRepository();
            container.register(EXPENSE_REPOSITORY, newExpenseRepo);
            this.expenseRepository = newExpenseRepo;
        }

        if (this.categoryRepository == null){
            const newCatRepo = new CategoryRepository();
            container.register(CATEGORY_REPOSITORY, newCatRepo);
            this.categoryRepository = newCatRepo;
        }
    }

    async getSumNegativeForMonth(userId: string, date: Date, walletId: string) {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const resultSum = await this.expenseRepository.sumNegativeExpensesForMonth(userId, year, month, walletId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err.message}`);
        }
    }

    async getSumPositiveForMonth(userId: string, date: Date, walletId: string) {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const resultSum = await this.expenseRepository.sumPositiveExpensesForMonth(userId, year, month, walletId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err.message}`);
        }
    }

    async getSumNegativeForDateRange(userId: string, startDate: Date, endDate: Date, targetCategoryId: number) {
        try {
            const resultSum = await this.expenseRepository.sumNegativeExpensesForDateRange(userId, startDate, endDate, targetCategoryId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err.message}`);
        }
    }

    async getCurrentWalletBalance(userId: string, walletId: string) {
        try {
            const categories = await this.categoryRepository.getAllforUserInWallet(userId, walletId);
            const categoryIds = categories.map(category => category.id);
            const balanceMap = new Map<number, number>();

            for (const id of categoryIds){
                const resultSum = await this.expenseRepository.getCurrentWalletBalance(walletId, id);
                console.log(RED, resultSum, RESET_COLOR);
                balanceMap.set(id,resultSum);
            }

            return balanceMap;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err.message}`);
        }
    }
    
}