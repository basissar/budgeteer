import { Wallet } from "../model/Wallet.ts";
import { WalletRepository } from "../repository/walletRepository.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Expense } from "../model/Expense.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { Category } from "../model/Category.ts";
import { Op } from "npm:sequelize";
import { WalletDetailsTO } from "../model/WalletDetailsTo.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";

export class WalletService {

    public walletRepository: WalletRepository;

    public userRepository: UserRepository;

    public expenseRepository: ExpenseRepository;;

    constructor(walletRepository: WalletRepository, userRepository: UserRepository, expenseRepository: ExpenseRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Creates wallet with initial amount
     * @param wallet object containing name and currency
     * @param initialAmount amount of money first put into wallet
     * @returns 
     */
    public async createWallet(wallet: Wallet, initialAmount: number): Promise<Wallet | null> {
        try {
            const createdWallet = await this.walletRepository.save(wallet);

            if (createdWallet == null) {
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

            const toReturn = await this.walletRepository.findById(wallet.id);

            return toReturn;
        } catch (error) {
            throw new ServiceError(`Wallet service error: error creating wallet: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves all wallets for user
     * @param id user id
     * @returns 
     */
    public async getAllWalletsForUser(id: string): Promise<Wallet[] | null> {
        const userExists = await this.userRepository.exists(id);

        if (!userExists) {
            return null;
        }

        return await this.walletRepository.getAllForUser(id);
    }

    /**
     * Retrieves wallet for user
     * @param walletId wanted wallet
     * @param userId user id for ownership check
     * @returns 
     */
    public async getWallet(walletId: string, userId: string) {
        const belongsToUser = await this.belongsToUser(userId, walletId);

        if (!belongsToUser){
            throw new UnauthorizedError(`Wallet does not belong to user with id ${userId}`)
        }


        const foundWallet = await this.walletRepository.findById(walletId);
        if (!foundWallet) {
            return null;
        }

        const walletCategories = await Category.findAll({
            where: {
                [Op.or]: [
                    { walletId: walletId },
                    { walletId: null }
                ]
            }
        });

        const walletBalance = await this.expenseRepository.getBalanceTotal(walletId);

        const walletDetailsTO = new WalletDetailsTO();
        walletDetailsTO.walletId = foundWallet.id;
        walletDetailsTO.name = foundWallet.name;
        walletDetailsTO.amount = walletBalance;
        walletDetailsTO.currency = foundWallet.currency;
        walletDetailsTO.categories = walletCategories;

        return walletDetailsTO;
    }

    /**
     * Checks existence of wallet
     * @param walletId 
     * @returns 
     */
    public async exists(walletId: string): Promise<boolean> {
        try {
            return await this.walletRepository.exists(walletId);
        } catch (err) {
            throw new ServiceError("Wallet service error: " + (err as Error).message);
        }
    }

    /**
     * Ownership check for wallet
     * @param userId id of user supposedly owning the wallet
     * @param walletId id of wallet for ownership check
     * @returns 
     */
    public async belongsToUser(userId: string, walletId: string): Promise<boolean> {
        try {
            const foundWallet = await this.walletRepository.findById(walletId);

            if (foundWallet == null) {
                return false;
            }

            if (foundWallet.userId !== userId) {
                return false;
            }

            return true;
        } catch (error) {
            throw new ServiceError("Wallet Service error: " + (error as Error).message);
        }
    }

    /**
     * Deletes wallet with provided id
     * @param walletId id of wallet to be deleted
     * @returns 
     */
    public async deleteWallet(walletId: string): Promise<boolean> {

        const foundWallet = await this.walletRepository.findById(walletId);

        if (!foundWallet) {
            return false;
        }

        return await this.walletRepository.deleteById(walletId) != 0;
    }

    /**
     * Updates wallet with provided information
     * @param userId used for update authorization
     * @param walletId id of wallet we want to update
     * @param updates object with wanted updates
     * @returns 
     */
    public async updateWallet(userId: string, walletId: string, updates: Partial<Wallet>): Promise<Wallet | null> {
        const wallet = await this.walletRepository.findById(walletId);

        if (!wallet) {
            throw new NotFoundError(`Wallet with id ${walletId} does not exist.`);
        }

        if (wallet.userId !== userId) {
            throw new ServiceError(`Unauthorized to update wallet.`);
        }

        return await this.walletRepository.update(walletId, updates);
    }

}