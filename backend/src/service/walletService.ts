import {Wallet} from "../model/Wallet.ts";
import {WalletRepository} from "../repository/walletRepo.ts";
import {UserRepository} from "../repository/userRepo.ts";
import {NotFoundError} from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { container } from "../container.ts";
import { USER_REPOSITORY, WALLET_REPOSITORY, EXPENSE_SERVICE, EXPENSE_REPOSITORY } from "../config/macros.ts";
import { ExpenseService } from "../service/expenseService.ts";
import {Expense} from "../model/Expense.ts";
import { ExpenseRepository } from "../repository/expenseRepo.ts";

export class WalletService {

    public walletRepository: WalletRepository;

    public userRepository: UserRepository;

    public expenseRepository: ExpenseRepository;;

    constructor(){
        const userRepo = container.resolve(USER_REPOSITORY);
        const walletRepo = container.resolve(WALLET_REPOSITORY);
        const expRepo = container.resolve(EXPENSE_REPOSITORY);

        if(userRepo == null){
            const newUserRepo = new UserRepository();
            container.register(USER_REPOSITORY, newUserRepo);
            this.userRepository = newUserRepo;
        } else {
            this.userRepository = userRepo;
        }

        if (walletRepo == null){
            const newWalletRepo = new WalletRepository();
            container.register(WALLET_REPOSITORY, newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }

        if (expRepo == null){
            const newExpRepo = new ExpenseRepository();
            container.register(EXPENSE_REPOSITORY, newExpRepo);
            this.expenseRepository = newExpRepo;
        } else {
            this.expenseRepository = expRepo;
        }

    }

    async createWallet(wallet: Wallet, initialAmount: number): Promise<Wallet| null> {
        try {
            const createdWallet = await this.walletRepository.save(wallet);

            if(!createdWallet) {
                throw new ServiceError(`Wallet service error: failed to create a wallet`);
            }

            const initialExpense = new Expense({
                name:"Initial Expense",
                amount: initialAmount,
                targetCategoryId: 1,
                walletId: createdWallet.id,
            });

            const createdExpense = await this.expenseRepository.save(initialExpense);

            if (!createdExpense) {
                throw new Error("Failed to create initial expense");
            }

            return createdWallet;
        } catch (error) {
            throw new ServiceError(`Wallet service error: error creating wallet: ${error.message}`);
        }
    }

    async getAllWalletsForUser(id: string): Promise<Wallet[] | null> {
        const userExists = await this.userRepository.exists(id);

        if(!userExists){
            throw new NotFoundError("User with identifier: " + id + " does not exist.");
        }

        return await this.walletRepository.getAllForUser(id);
    }

    async getWallet(walletId: string): Promise<Wallet | null>{
        return await this.walletRepository.findById(walletId);
    }

    async getWalletForUser(walletId: string, userId: string) {
        const userExists = await this.userRepository.exists(userId);
        
        if(!userExists){
            throw new NotFoundError("User with identifier: " + userId + " does not exist.");
        }

        const foundWallet = await this.walletRepository.findById(walletId);
        if(!foundWallet){
            return null;
        }

        if(foundWallet.userId !== userId){
            throw new Error('Wallet does not belong to the user.');
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

            if(foundWallet == null){
                //probably better to log it and return false
                // throw new NotFoundError(`Wallet with ${walletId} does not exist`);
                console.error(`Wallet with ${walletId} does not exist`);
                return false;
            }

            if (foundWallet.userId !== userId){
                return false;
            } 

            return true;
        } catch (error) {
            throw new ServiceError("Wallet Service error: " + error.message);
        }
    }

    async deleteWalletForUser(userId: string, walletId: string): Promise<boolean>{
        const userExists = await this.userRepository.existsById(userId);

        if(!userExists){
            // throw new Error("User with identifier: " + userId + " does not exist.");
            console.error(`User with identifier: ${userId} does not exist`);
            return false;
        }

        const foundWallet = await this.walletRepository.findById(walletId);
        
        if(!foundWallet){
            throw new NotFoundError("Wallet with identifier: " + walletId + " does not exist");
        }

        if(foundWallet.userId != userId && foundWallet.userId !== null){
            throw new Error("Wallet")
        }

        return await this.walletRepository.deleteById(walletId) != 0;
    }



}