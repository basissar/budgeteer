import { CATEGORY_SERVICE, EXPENSE_REPOSITORY, WALLET_SERVICE, BUDGET_SERVICE, USER_REPOSITORY, ACCOUNT_SERVICE, ACHIEVEMENT_SERVICE } from "../config/macros.ts";
import { container } from "../utils/container.ts";
import { DuplicateError } from "../errors/DuplicateError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { Expense } from "../model/Expense.ts";
// import { BudgetRepository } from "../repository/budgetRepository.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { WalletRepository } from "../repository/walletRepository.ts";
import { BudgetService } from "./budgetService.ts";
import { CategoryService } from "./categoryService.ts";
import { WalletService } from "./walletService.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";
import { AccountService } from "./accountService.ts";
import { EventType } from "../model/EventType.ts";
import { AchievementService } from "./achievementService.ts";
import { AchievementType } from "../model/AchievementType.ts";

export class ExpenseService {

    private expenseRepository: ExpenseRepository;

    private walletService: WalletService;

    private budgetService: BudgetService;

    private userRepository: UserRepository;

    private accountService: AccountService;

    private achievementService: AchievementService;

    constructor() {
        const expRepo = container.resolve(EXPENSE_REPOSITORY);

        const wallSer = container.resolve(WALLET_SERVICE);

        const budgetSer = container.resolve(BUDGET_SERVICE);

        const userRepo = container.resolve(USER_REPOSITORY);

        const accountSer = container.resolve(ACCOUNT_SERVICE);

        const achievementSer = container.resolve(ACHIEVEMENT_SERVICE);

        if (expRepo == null) {
            const newExpRepo = new ExpenseRepository();
            container.register(EXPENSE_REPOSITORY, newExpRepo);
            this.expenseRepository = newExpRepo;
        } else {
            this.expenseRepository = expRepo;
        }

        if (wallSer == null) {
            const newWallSer = new WalletService();
            container.register(WALLET_SERVICE, newWallSer);
            this.walletService = newWallSer;
        } else {
            this.walletService = wallSer;
        }

        if (budgetSer == null) {
            const newBudgetRepo = new BudgetService();
            container.register(BUDGET_SERVICE, newBudgetRepo);
            this.budgetService = newBudgetRepo;
        } else {
            this.budgetService = budgetSer;
        }

        if (userRepo == null) {
            const newUserRepo = new UserRepository();
            container.register(USER_REPOSITORY, newUserRepo);
            this.userRepository = newUserRepo;
        } else {
            this.userRepository = userRepo;
        }

        if (accountSer == null) {
            const newAccountSer = new AccountService();
            container.register(ACCOUNT_SERVICE, newAccountSer);
            this.accountService = newAccountSer;
        } else {
            this.accountService = accountSer;
        }

        if (achievementSer == null){
            const newAchievementSer = new AchievementService();
            container.register(ACHIEVEMENT_SERVICE, newAchievementSer);
            this.achievementService = newAchievementSer;
        } else {
            this.achievementService = achievementSer;
        }
    }

    async createExpense(expense: Expense, userId: string) {
        try {
            const exists = await this.exists(expense.id);

            if (exists) {
                throw new DuplicateError(`Expense with id ${expense.id} already exists`);
            }

            // Set the time components of the expense date to the start of the day 
            // when looking up the date sequelize compares hours as well so we set it to midnight
            const expenseDate = new Date(expense.date);
            expenseDate.setHours(0, 0, 0, 0);

            expense.set('date', expenseDate);

            await this.expenseRepository.save(expense);

            const foundExpense = await this.expenseRepository.findById(expense.id);

            if (foundExpense != null) {
                const createdToday = await this.createdToday(userId, foundExpense.date);
                const createdThisWeek = await this.createdThisWeek(userId, foundExpense.date);
                const createdThisMonth = await this.createdThisMonth(userId, foundExpense.date);

                if (foundExpense.amount < 0) {
                    const budgets = await this.budgetService.findByWalletAndCategory(foundExpense?.walletId, foundExpense?.targetCategoryId);

                    if (budgets != null) {
                        for (const budget of budgets) {

                            if (budget.recurrence == 'monthly' && createdThisMonth){
                                await this.budgetService.updateMoney(budget, -foundExpense.amount);
                            } else if (budget.recurrence == 'weekly' && createdThisWeek){
                                await this.budgetService.updateMoney(budget, -foundExpense.amount);
                            } else if (budget.recurrence == 'daily' && createdToday){
                                await this.budgetService.updateMoney(budget, -foundExpense.amount);
                            }
                        }
                    }
                }
            }

            //expense created so we create an event
            const eventResult = await this.accountService.handleEvent(EventType.ADD_EXPENSE, userId);

            const finalResponse = {
                eventResult: eventResult,
                expense: foundExpense
            }

            const countByCategory = await this.expenseRepository.getCountByCategoryForUser(userId,expense.targetCategoryId);

            const account = await this.accountService.getIdForUser(userId);

            await this.achievementService.evaluateAchievement(account!.id, AchievementType.EXPENSE, [this.expenseRepository, countByCategory])
            return finalResponse;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async exists(id: number) {
        try {
            return await this.expenseRepository.exists(id);
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async findById(id: number) {
        try {
            return await this.expenseRepository.findById(id);
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async findByWallet(walletId: string, userId: string) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }

            const foundExpenses = await this.expenseRepository.findByWallet(walletId);
            return foundExpenses;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack);
        }
    }

    async findByUser(userId: string) {
        try {
            const foundExpenses = await this.expenseRepository.findByUser(userId);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.stack)
        }
    }

    async findBySource(walletId: string, userId: string, sourceCatId: number) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }
            
            const foundExpenses = await this.expenseRepository.findBySource(walletId, sourceCatId);

            return foundExpenses;
        } catch (err) {
            throw new ServiceError(`Expense service error: ${err.message}`);
        }
    }

    async findByTarget(walletId: string, userId: string, targetCat: number) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }

            const foundExpenses = await this.expenseRepository.findByTarget(walletId, targetCat);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError(`Expense service error: ${error.message}`);
        }
    }

    async findByMaxAmount(walletId: string, userId: string, maxAmount: number) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }

            const foundExpenses = await this.expenseRepository.findByMaxAmount(walletId, maxAmount);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError(`Expense service error: ${error.message}`);
        }
    }

    async findByMinAmount(walletId: string, userId: string, minAmount: number) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }

            const foundExpenses = await this.expenseRepository.findByMinAmount(walletId, minAmount);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError(`Expense service error: ${error.message}`);
        }
    }

    async deleteExpense(id: number) {
        try {
            const exists = await this.expenseRepository.exists(id);

            if (!exists) {
                throw new NotFoundError(`Expense with id ${id} not found`);
            }

            const foundExpense = await this.expenseRepository.findById(id);

            if (foundExpense != null) {
                if (foundExpense.amount < 0){
                    const budgets = await this.budgetService.findByWalletAndCategory(foundExpense.walletId, foundExpense.targetCategoryId);

                    if (budgets != null){
                        for (const budget of budgets) {
                            await this.budgetService.updateMoney(budget, foundExpense.amount);
                        }
                    }
                }
            }

            const deletedRows = await this.expenseRepository.deleteById(id);

            return deletedRows != 0;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.message);
        }
    }

    async findByDate(userId: string, walletId: string, date: Date, categoryId: number) {
        try {
            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                return null;
            }

            const foundExpenses = await this.expenseRepository.findByDate(walletId, date, categoryId);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.message);
        }
    }


    //TODO delete all in category
    //TODO delete all in wallet

    private async createdToday(userId: string, expenseDate: Date){
        const foundUser = await this.userRepository.findById(userId);
        if (foundUser != null) {
            const timezone = foundUser.timezone;

            const userToday = DateTime.now().setZone(timezone);

            const year = userToday.year;
            const month = userToday.month;
            const day = userToday.day;

            const expYear = expenseDate.getFullYear();
            const expMonth = expenseDate.getMonth() + 1;
            const expDay = expenseDate.getDate();

            return year === expYear && month === expMonth && day === expDay;
        }
    }

    private async createdThisWeek(userId: string, expenseDate: Date){
        const foundUser = await this.userRepository.findById(userId);
        if ( foundUser != null){
            const timezone = foundUser.timezone;

            const userToday = DateTime.now().setZone(timezone);

            const startOfWeek = userToday.startOf('week');
            const endOfWeek = userToday.endOf('week');

            const expenseDateTime = DateTime.fromJSDate(expenseDate).setZone(timezone);

            return expenseDateTime >= startOfWeek && expenseDateTime <= endOfWeek;
        }
    }

    private async createdThisMonth(userId: string, expenseDate: Date){
        const foundUser = await this.userRepository.findById(userId);
        if ( foundUser != null){
            const timezone = foundUser.timezone;

            const userToday = DateTime.now().setZone(timezone);

            const year = userToday.year;
            const month = userToday.month;

            const expYear = expenseDate.getFullYear();
            const expMonth = expenseDate.getMonth() + 1;

            return year === expYear && month === expMonth;
        }
    }
}