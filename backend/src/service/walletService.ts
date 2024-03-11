import {Wallet} from "../model/Wallet.ts";
import {WalletRepository} from "../repository/walletRepo.ts";
import {UserRepository} from "../repository/userRepo.ts";
import {NotFoundError} from "../errors/NotFoundError.ts";

export class WalletService {

    constructor(private readonly walletRepo: WalletRepository,
         private readonly userRepo: UserRepository) {}

    async createWallet(wallet: Wallet): Promise<Wallet | null> {
        return await this.walletRepo.save(wallet);
    }

    async getAllWalletsForUser(id: number): Promise<Wallet[] | null> {
        const userExists = this.userRepo.existsById(id);

        if(!userExists){
            throw new NotFoundError("User with identifier: " + id + " does not exist.");
        }

        return await this.walletRepo.getAllForUser(id);
    }

    async getWallet(walletId: number): Promise<Wallet | null>{
        return await this.walletRepo.findById(walletId);
    }

    async getWalletForUser(walletId: number, userId: number) {
        const userExists = this.userRepo.exists(userId);
        
        if(!userExists){
            throw new NotFoundError("User with identifier: " + userId + " does not exist.");
        }

        const foundWallet = await this.walletRepo.findById(walletId);
        if(!foundWallet){
            return null;
        }

        if(foundWallet.userId !== userId){
            throw new Error('Wallet does not belong to the user.');
        }

        return foundWallet;
    }

    async deleteWalletForUser(userId: number, walletId: number): Promise<boolean>{
        const userExists = this.userRepo.existsById(userId);

        if(!userExists){
            throw new Error("User with identifier: " + userId + " does not exist.");
        }

        const foundWallet = await this.walletRepo.findById(walletId);
        
        if(!foundWallet){
            throw new NotFoundError("Wallet with identifier: " + walletId + " does not exist");
        }

        if(foundWallet.userId != userId && foundWallet.userId !== null){
            throw new Error("Wallet")
        }

        return await this.walletRepo.deleteById(walletId) != 0;
    }



}