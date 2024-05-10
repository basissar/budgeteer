import { BUDGET_REPOSITORY, EXPENSE_REPOSITORY, USER_REPOSITORY, WALLET_REPOSITORY } from "../config/macros.ts";
import { container } from "../utils/container.ts";
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

export class BudgetService {
    public budgetRepository: BudgetRepository;

    public walletRepository: WalletRepository;

    public expenseRepository: ExpenseRepository;

    private userRepository: UserRepository;

    constructor() {
        const budgetRepo = container.resolve(BUDGET_REPOSITORY);
        const walletRepo = container.resolve(WALLET_REPOSITORY);
        const expenseRepo = container.resolve(EXPENSE_REPOSITORY);
        const userRepo = container.resolve(USER_REPOSITORY);

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

        if (expenseRepo == null) {
            const newExpenseRepo = new ExpenseRepository();
            container.register(EXPENSE_REPOSITORY, newExpenseRepo);
            this.expenseRepository = newExpenseRepo;
        } else {
            this.expenseRepository = expenseRepo;
        }

        if (userRepo == null) {
            const newUserRepo = new UserRepository();
            container.register(USER_REPOSITORY, newUserRepo);
            this.userRepository = newUserRepo;
        } else {
            this.userRepository = userRepo;
        }
    }

    async createBudget(userId: string, budget: Budget) {
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
                    expenses = await this.expenseRepository.findByDateRange(budget.walletId, startDate, endDate, budget.categoryId);
                }

                if (expenses != null) {
                    const finalAmount = this.calculateExpenseTotal(expenses);

                    budget.set('currentAmount', finalAmount);
                } else {

                    budget.set('currentAmount', 0);
                }

                return await this.budgetRepository.save(budget);
            }
        } catch (error) {
            throw new ServiceError(`Budget service error: ${error.message}`);
        }
    }

    async updateBudget(budget: Budget) {
        try {
            const exists = await this.budgetRepository.exists(budget.id);

            if (!exists) {
                throw new NotFoundError(`Budget with id: ${budget.id} does not exist and thus cannot be updated`);
            }

            return await this.budgetRepository.save(budget);
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async findByWallet(walletId: string) {
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
                return false;
            }

            const deletedRows = await this.budgetRepository.deleteById(budgetId);

            return deletedRows != 0;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`)
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
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async findById(id: number) {
        try {
            const result = await this.budgetRepository.findById(id);

            return result;
        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
        }
    }

    async resetBudget(budgetId: number) {
        try {
            const foundBudget = await this.budgetRepository.findById(budgetId);

            if (!foundBudget) {
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

    async resetAllInWallet(walletId: string) {
        try {
            const foundBudgets = await this.budgetRepository.findByWallet(walletId);

            if (foundBudgets != null) {
                for (const budget of foundBudgets) {
                    this.resetBudget(budget.id);
                }
            }

        } catch (err) {
            throw new ServiceError(`Budget service error: ${err.message}`);
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