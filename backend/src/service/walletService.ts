import { Wallet } from "../model/Wallet.ts";
import { WalletRepository } from "../repository/walletRepository.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { container } from "../utils/container.ts";
import { USER_REPOSITORY, WALLET_REPOSITORY, EXPENSE_SERVICE, EXPENSE_REPOSITORY } from "../config/macros.ts";
import { ExpenseService } from "../service/expenseService.ts";
import { Expense } from "../model/Expense.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";

export class WalletService {

    public walletRepository: WalletRepository;

    public userRepository: UserRepository;

    public expenseRepository: ExpenseRepository;;

    constructor() {
        const userRepo = container.resolve(USER_REPOSITORY);
        const walletRepo = container.resolve(WALLET_REPOSITORY);
        const expRepo = container.resolve(EXPENSE_REPOSITORY);

        if (userRepo == null) {
            const newUserRepo = new UserRepository();
            container.register(USER_REPOSITORY, newUserRepo);
            this.userRepository = newUserRepo;
        } else {
            this.userRepository = userRepo;
        }

        if (walletRepo == null) {
            const newWalletRepo = new WalletRepository();
            container.register(WALLET_REPOSITORY, newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }

        if (expRepo == null) {
            const newExpRepo = new ExpenseRepository();
            container.register(EXPENSE_REPOSITORY, newExpRepo);
            this.expenseRepository = newExpRepo;
        } else {
            this.expenseRepository = expRepo;
        }

    }

    async createWallet(wallet: Wallet, initialAmount: number): Promise<Wallet | null> {
        try {
            const createdWallet = await this.walletRepository.save(wallet);

            if (createdWallet == null){
                throw new ServiceError(`Wallet creation failed`);
            }

            const initialExpense = new Expense({
                name: "Initial Expense",
                amount: initialAmount,
                targetCategoryId: 1,
                walletId: createdWallet.id,
                date: new Date(),
            });

            const createdExpense = await this.expenseRepository.save(initialExpense);

            if (!createdExpense) {
                throw new Error("Failed to create initial expense");
            }

            const toReturn = await this.walletRepository.getAfterCreate(wallet.id);

            return toReturn;
        } catch (error) {
            throw new ServiceError(`Wallet service error: error creating wallet: ${error.message}`);
        }
    }

    async getAllWalletsForUser(id: string): Promise<Wallet[] | null> {
        const userExists = await this.userRepository.exists(id);

        if (!userExists) {
            return null;
        }

        return await this.walletRepository.getAllForUser(id);
    }

    async getWallet(walletId: string): Promise<Wallet | null> {
        return await this.walletRepository.findById(walletId);
    }

    async getWalletForUser(walletId: string, userId: string) {
        const userExists = await this.userRepository.exists(userId);

        if (!userExists) {
            return null;
        }

        const foundWallet = await this.walletRepository.findById(walletId);
        if (!foundWallet) {
            return null;
        }

        return foundWallet;
    }

    async exists(walletId: string): Promise<boolean> {
        try {
            return await this.walletRepository.exists(walletId);
        } catch (err) {
            throw new ServiceError("Wallet service error: " + err.message);
        }
    }

    async belongsToUser(userId: string, walletId: string): Promise<boolean> {
        try {
            const foundWallet = await this.getWallet(walletId);

            if (foundWallet == null) {
                return false;
            }

            if (foundWallet.userId !== userId) {
                return false;
            }

            return true;
        } catch (error) {
            throw new ServiceError("Wallet Service error: " + error.message);
        }
    }

    async deleteWalletForUser(userId: string, walletId: string): Promise<boolean> {
        const userExists = await this.userRepository.existsById(userId);

        if (!userExists) {
            return false;
        }

        const foundWallet = await this.walletRepository.findById(walletId);

        if (!foundWallet) {
            return false;
        }

        return await this.walletRepository.deleteById(walletId) != 0;
    }

    async getCurrentAmount(walletId: string) {
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (!foundWallet) {
                throw new NotFoundError("Wallet with identifier: " + walletId + " does not exist");
            }

            const foundExpenses = await this.expenseRepository.findByWallet(walletId);

            if (foundExpenses == null || foundExpenses.length == 0) {
                return 0;
            } else {
                const currentAmount = foundExpenses
                    .filter(exp => exp.sourceCategoryId === null)
                    .reduce((total, exp) => total + exp.amount, 0);

                return currentAmount;
            }

        } catch (err) {
            throw new ServiceError(`Wallet service error: ${err.message}`);
        }
    }



}