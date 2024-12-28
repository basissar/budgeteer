import { CATEGORY_REPOSITORY, EXPENSE_REPOSITORY, RED, RESET_COLOR } from "../config/macros.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { container } from "../utils/container.ts";


export class AnalyticsService {

    private expenseRepository: ExpenseRepository;

    private categoryRepository: CategoryRepository;

    constructor(expenseRepository: ExpenseRepository, categoryRepository: CategoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    async getSumNegativeForMonth(userId: string, date: Date, walletId: string) {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const resultSum = await this.expenseRepository.sumNegativeExpensesForMonth(userId, year, month, walletId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }

    async getSumPositiveForMonth(userId: string, date: Date, walletId: string) {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const resultSum = await this.expenseRepository.sumPositiveExpensesForMonth(userId, year, month, walletId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }

    async getTotalNegativeSumPerCategory(userId: string, startDate: Date, endDate: Date, targetCategoryId: number) {
        try {
            const resultSum = await this.expenseRepository.totalNegativeSumPerCategory(userId, startDate, endDate, targetCategoryId);

            return resultSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }

    /**
     * Retrieves map of positive and map of negative sums per category.
     * @param userId - needed for category retrieval
     * @param walletId 
     * @param startDate  
     * @param endDate 
     */
    async getSumsForDateRange(userId: string, walletId: string, startDate: Date, endDate: Date) {
        const categories = await this.categoryRepository.getAllforUserInWallet(userId, walletId);
        
        const positiveSums = new Map();
        const negativeSums = new Map();


        for (const cat of categories) {
            const posCatSum = await this.expenseRepository.sumPositiveExpensesForDateRange(walletId, startDate, endDate, cat.id);
            const negCatSum = await this.expenseRepository.sumNegativeExpensesForDateRange(walletId, startDate, endDate, cat.id);

            positiveSums.set(cat.id, posCatSum);
            negativeSums.set(cat.id, negCatSum);
        }

        return {
            positiveSumMap: positiveSums,
            negativeSumMap: negativeSums,
        };
    }

    async getCurrentWalletBalance(userId: string, walletId: string) {
        try {
            const categories = await this.categoryRepository.getAllforUserInWallet(userId, walletId);
            const categoryIds = categories.map(category => category.id);
            const balanceMap = new Map<number, number>();

            for (const id of categoryIds){
                const resultSum = await this.expenseRepository.getCurrentWalletBalance(walletId, id);
                balanceMap.set(id,resultSum);
            }

            return balanceMap;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }

    /**
     * Retrieves total wallet balance
     * @param walletId target wallet
     * @returns total sum of all expenses
     */
    async getTotalWalletBalance(walletId: string){
        try {
            const totalSum = await this.expenseRepository.getBalanceTotal(walletId);

            return totalSum;
        } catch (err){
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }
    
}