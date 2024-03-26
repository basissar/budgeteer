import {Wallet} from "../model/Wallet.ts";
import {WalletRepository} from "../repository/walletRepo.ts";
import {UserRepository} from "../repository/userRepo.ts";
import {NotFoundError} from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { container } from "../container.ts";

export class WalletService {

    public walletRepository: WalletRepository;

    public userRepository: UserRepository;

    constructor(){
        const userRepo = container.resolve("UserRepository");
        const walletRepo = container.resolve("WalletRepository");

        if(userRepo == null){
            const newUserRepo = new UserRepository();
            container.register("UserRepository", newUserRepo);
            this.userRepository = newUserRepo;
        } else {
            this.userRepository = userRepo;
        }

        if (walletRepo == null){
            const newWalletRepo = new WalletRepository();
            container.register("WalletRepository", newWalletRepo);
            this.walletRepository = newWalletRepo;
        } else {
            this.walletRepository = walletRepo;
        }

    }

    async createWallet(wallet: Wallet): Promise<Wallet | null> {
        //todo add check for existing userId
        return await this.walletRepository.save(wallet);
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