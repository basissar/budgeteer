import { BudgetRepository } from "../repository/budgetRepository.ts";
import { Budget } from "../model/Budget.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { WalletRepository } from "../repository/walletRepository.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";
import { Expense } from "../model/Expense.ts";
import { AccountService } from "./accountService.ts";
import { EventType } from "../model/EventType.ts";
import { ValidationError } from "../errors/ValidationError.ts";

export class BudgetService {
    public budgetRepository: BudgetRepository;

    public walletRepository: WalletRepository;

    public expenseRepository: ExpenseRepository;

    private userRepository: UserRepository;

    private accountService: AccountService;

    constructor(budgetRepository: BudgetRepository,
        walletRepository: WalletRepository,
        expenseRepository: ExpenseRepository,
        userRepository: UserRepository,
        accountService: AccountService) {
            this.budgetRepository = budgetRepository;
            this.walletRepository = walletRepository;
            this.expenseRepository = expenseRepository;
            this.userRepository = userRepository;
            this.accountService = accountService;
    }

    /**
     * Creates a budget
     * @param userId used for retrieval of user's timezone for update check
     * @param budget to create
     * @returns 
     */
    public async createBudget(userId: string, budget: Budget) {
        if (budget.limit <= 0 ) {
            throw new ValidationError(`Budget limit cannot be negative values including zero`);
        }

        try {
            const exists = await this.budgetRepository.exists(budget.id);

            if (exists) {
                throw new DuplicateError(`Budget with id: ${budget.id} already exists`);
            }

            let expenses = null;
            let startDate = null;
            let endDate = null;

            const foundUser = await this.userRepository.findById(userId)

            if (foundUser) {
                const timezone = foundUser.timezone;
                const userToday = DateTime.now().setZone(timezone);

                if (budget.recurrence == 'daily') {
                    const date = this.parseDate(userToday);
                    expenses = await this.expenseRepository.findByDate(budget.walletId, date, budget.categoryId);
                } else if (budget.recurrence == 'weekly') {
                    startDate = this.getActualDates(userToday, 'week').start;
                    endDate = this.getActualDates(userToday, 'week').end;

                } else if (budget.recurrence == 'monthly') {
                    startDate = this.getActualDates(userToday, 'month').start;
                    endDate = this.getActualDates(userToday, 'month').end;
                }

                if (startDate && endDate) {
                    expenses = await this.expenseRepository.findByDateRangeWithCategory(budget.walletId, startDate, endDate, budget.categoryId);
                }

                if (expenses != null) {
                    const finalAmount = this.calculateExpenseTotal(expenses);

                    budget.set('currentAmount', finalAmount);
                } else {

                    budget.set('currentAmount', 0);
                }

                const eventResult = await this.accountService.handleEvent(EventType.CREATE_BUDGET, userId);

                const createdBudget = await this.budgetRepository.save(budget);

                const toReturn = await this.budgetRepository.findById(createdBudget!.id);

                const finalResponse = {
                    eventResult: eventResult,
                    budget: toReturn
                }

                return finalResponse;
            }
        } catch (error) {
            throw new ServiceError(`Budget service error: ${(error as Error).message}`);
        }
    }

    /**
     * Updates budget
     * @param budget to be updated
     * @returns 
     */
    public async updateBudget(budget: Budget) {
        try {
            const exists = await this.budgetRepository.exists(budget.id);

            if (!exists) {
                throw new NotFoundError(`Budget with id: ${budget.id} does not exist and thus cannot be updated`);
            }

            return await this.budgetRepository.save(budget);
        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Retrieves budgets for specific wallet
     * @param walletId wallet id
     * @returns 
     */
    public async findByWallet(walletId: string) {
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (!foundWallet) {
                return null;
            }

            const foundBudgets = await this.budgetRepository.findByWallet(walletId);

            return foundBudgets;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Retrieves budgets by wallet and category
     * @param walletId wanted wallet
     * @param categoryId wanted category
     * @returns 
     */
    public async findByWalletAndCategory(walletId: string, categoryId: number) {
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (!foundWallet) {
                return null;
            }

            const foundBudgets = await this.budgetRepository.findByWalletAndCategory(walletId, categoryId);

            return foundBudgets;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Deletes budget
     * @param budgetId to be deleted 
     * @returns 
     */
    public async deleteBudget(budgetId: number) {
        try {
            const foundBudget = await this.budgetRepository.exists(budgetId);

            if (!foundBudget) {
                return false;
            }

            const deletedRows = await this.budgetRepository.deleteById(budgetId);

            return deletedRows != 0;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`)
        }
    }

    /**
     * Returns true if user went over the limit, else false
     * @param toUpdate budget that we are updating
     * @param amount amount of added money
     */
    async updateMoney(toUpdate: Budget, amount: number): Promise<boolean> {
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
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Finds budget by id
     * @param id of wanted budget
     * @returns 
     */
    public async findById(id: number) {
        try {
            const result = await this.budgetRepository.findById(id);

            return result;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Resets budget
     * @param budgetId budget to be reset 
     * @returns 
     */
    public async resetBudget(budgetId: number) {
        try {
            const foundBudget = await this.budgetRepository.findById(budgetId);

            if (!foundBudget) {
                throw new NotFoundError(`Budget ${budgetId} not found`);
            }

            // foundBudget.set({
            //     currentAmount: 0,
            // });

            foundBudget.currentAmount = 0;

            const savedBudget = await this.budgetRepository.save(foundBudget);

            if (savedBudget != null) {
                return true;
            } else {
                throw new ServiceError(`Budget service error: error reseting budget`);
            }

        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    /**
     * Checks whether budget is over limit
     * @param budgetId 
     * @returns 
     */
    public async checkBudgetLimit(budgetId: number){
        try {
            const foundBudget = await this.budgetRepository.findById(budgetId);

            if (!foundBudget) {
                throw new NotFoundError(`Budget ${budgetId} not found`);
            }

            let overLimit = false;

            if (foundBudget.currentAmount >= foundBudget.limit){
                overLimit = true;
            }

            return overLimit;
        } catch (error) {
            throw new ServiceError(`Budget service error: ${(error as Error).message}`);
        }
    }

    /**
     * Resets all budgets in wallet
     * @param walletId 
     */
    public async resetAllInWallet(walletId: string) {
        try {
            const foundBudgets = await this.budgetRepository.findByWallet(walletId);

            if (foundBudgets != null) {
                for (const budget of foundBudgets) {
                    this.resetBudget(budget.id);
                }
            }

        } catch (err) {
            throw new ServiceError(`Budget service error: ${(err as Error).message}`);
        }
    }

    private calculateExpenseTotal(expenses: Expense[]) {
        const negativeAmountsSum = expenses.reduce((total, expense) => {
            if (expense.amount < 0) {
                return total + expense.amount;
            }
            return total;
        }, 0);

        const finalAmount = Math.abs(negativeAmountsSum);

        return finalAmount;
    }

    private getActualDates(date: DateTime, queryParam: string) {
        const start = date.startOf(queryParam);

        const end = date.endOf(queryParam);
        const startDate = this.parseDate(start);
        const endDate = this.parseDate(end);

        return {
            start: startDate,
            end: endDate
        }

    }

    private parseDate(date: DateTime) {
        const result = new Date(date.year, date.month - 1, date.day)
        return result;
    }

}