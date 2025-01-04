import { ServiceError } from "../errors/ServiceError.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { SumSearchParameters } from "../repository/sumSearchParams.ts";
import { Message } from "../validation/errorMessage.ts";
import { Validator } from "../validation/validator.ts";


export class AnalyticsService {

    private expenseRepository: ExpenseRepository;

    private categoryRepository: CategoryRepository;

    private validator: Validator;

    constructor(expenseRepository: ExpenseRepository, categoryRepository: CategoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.validator = new Validator();

    }

    /**
     * Retrieves map of positive and map of negative sums per category. AKA overall income and overall expenses in each category
     * @param walletId 
     * @param startDate  
     * @param endDate 
     */
    async getSumsForDateRangePerCategory(searchParameters: SumSearchParameters) {
        const categories = await this.categoryRepository.getAllForWallet(searchParameters.walletId!);

        const positiveSums = new Map();
        const negativeSums = new Map();


        for (const cat of categories) {
            searchParameters.targetCategoryId = cat.id;

            searchParameters.amountCondition = true;

            const posCatSum = await this.expenseRepository.sumExpenses(searchParameters);

            searchParameters.amountCondition = false;

            const negCatSum = await this.expenseRepository.sumExpenses(searchParameters);

            positiveSums.set(cat.id, posCatSum);
            negativeSums.set(cat.id, negCatSum);
        }

        return {
            positiveSumMap: positiveSums,
            negativeSumMap: negativeSums,
        };
    }

    /**
     * Retrieves balances for each category in wallet
     * @param walletId 
     * @returns 
     */
    async getCategoryBalances(walletId: string) {
        try {
            const categories = await this.categoryRepository.getAllForWallet(walletId);
            const categoryIds = categories.map(category => category.id);
            const balanceMap = new Map<number, number>();

            for (const id of categoryIds) {
                const targetCategoryParams = new SumSearchParameters();
                targetCategoryParams.walletId = walletId;
                targetCategoryParams.targetCategoryId = id;

                const targetCategorySum = await this.expenseRepository.sumExpenses(targetCategoryParams);

                const sourceCategoryParams = new SumSearchParameters();
                sourceCategoryParams.walletId = walletId;
                sourceCategoryParams.sourceCategoryId = id;

                const sourceCategorySum = await this.expenseRepository.sumExpenses(sourceCategoryParams);

                const currentBalance = targetCategorySum - sourceCategorySum;

                if (currentBalance < 0) {
                    const unclassifiedBalance = balanceMap.get(1) || 0;
                    balanceMap.set(1, unclassifiedBalance + currentBalance);
                    balanceMap.set(id, 0);
                } else {
                    balanceMap.set(id, currentBalance);
                }
            }

            return balanceMap;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${(err as Error).stack}`);
        }
    }

    /**
     * Retrieves total wallet balance
     * @param walletId target wallet
     * @returns total sum of all expenses
     */
    async getTotalWalletBalance(walletId: string) {
        try {
            const totalSum = await this.expenseRepository.getBalanceTotal(walletId);

            return totalSum;
        } catch (err) {
            throw new ServiceError(`Analytics service error: ${err}`);
        }
    }

    /**
     * Method to retrieve sum.
     * @param searchParams 
     * @returns summed amount
     */
    async getExpenseSum(searchParams: SumSearchParameters) {
        try {

            const messages: Message[] = [];

            this.validator.validate(searchParams, messages);

            const result = await this.expenseRepository.sumExpenses(searchParams);

            return {
                result: result,
                messages: messages
            };
        } catch (error) {
            throw new ServiceError(`Analytics service error: ${(error as Error).message}`)
        }
    }
}