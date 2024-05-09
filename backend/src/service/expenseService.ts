import { CATEGORY_SERVICE, EXPENSE_REPOSITORY, WALLET_SERVICE, BUDGET_SERVICE } from "../config/macros.ts";
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

export class ExpenseService {

    public expenseRepository: ExpenseRepository;

    // public walletRepository: WalletRepository;

    private walletService: WalletService;

    private categoryService: CategoryService;

    private budgetService: BudgetService;

    constructor() {
        const expRepo = container.resolve(EXPENSE_REPOSITORY);
        // const walletRepo = container.resolve('WalletRepository');

        const wallSer = container.resolve(WALLET_SERVICE)

        const catSer = container.resolve(CATEGORY_SERVICE);

        const budgetSer = container.resolve(BUDGET_SERVICE);

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

        if (catSer == null) {
            const newCatSer = new CategoryService();
            container.register(CATEGORY_SERVICE, newCatSer);
            this.categoryService = newCatSer;
        } else {
            this.categoryService = catSer;
        }

        if (budgetSer == null) {
            const newBudgetRepo = new BudgetService();
            container.register(BUDGET_SERVICE, newBudgetRepo);
            this.budgetService = newBudgetRepo;
        } else {
            this.budgetService = budgetSer;
        }
    }

    async createExpense(expense: Expense) {
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

            const createdExpense = await this.expenseRepository.save(expense);

            if (createdExpense != null) {
                if (createdExpense.amount < 0) {
                    const budgets = await this.budgetService.findByWalletAndCategory(createdExpense?.walletId, createdExpense?.targetCategoryId);

                    if (budgets != null) {
                        for (const budget of budgets) {
                            await this.budgetService.updateMoney(budget, -createdExpense.amount);
                        }
                    }
                }
            }


            return createdExpense;
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
            /*
            const wallet = await this.walletService.getWallet(walletId);

            if (!wallet) {
                throw new NotFoundError(`Wallet with identifier ${walletId} does not exist`);
            }

            //optional ownership check
            if (wallet.userId !== userId) {
                throw new UnauthorizedError(`User does not have permission to access expenses for this wallet`);
            }
            */

            const foundWallet = await this.walletService.getWalletForUser(walletId, userId);

            if (!foundWallet) {
                return null;
            }

            if (foundWallet.id != walletId && foundWallet.userId !== userId) {
                throw new ServiceError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
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
                throw new ServiceError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
            }

            /*
                no need to check if category is in the wallet -> we are getting category id from categories 
                that we get from getAllForUserInWallet method in categoryServie
            */
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
                throw new ServiceError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
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
                throw new ServiceError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
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
                throw new ServiceError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
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
                throw new UnauthorizedError("Expense Service error: The IDs of the found wallet do not match the requested IDs.")
            }

            const foundExpenses = await this.expenseRepository.findByDate(walletId, date, categoryId);

            return foundExpenses;
        } catch (error) {
            throw new ServiceError("Expense service error: " + error.message);
        }
    }

    //TODO delete all in category
    //TODO delete all in wallet
}