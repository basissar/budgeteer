// import Wallet from "../database/exDatabase.ts";
import { RepositoryError } from "../errors/RepositoryError.ts";
import { Expense } from "../model/Expense.ts";
import {Wallet} from "../model/Wallet.ts";
import { BaseRepository } from "./baseRepository.ts";

export class WalletRepository implements BaseRepository<Wallet, string> {
    
    async save(wallet: Wallet): Promise<Wallet | null> {
        try {
            const result = await wallet.save();

            return result;
        } catch (error){
            throw new RepositoryError(`Wallet repository error: ${error.message}`);
        }
    }

    async findAll(): Promise<Wallet[] | null> {
        try{
            return await Wallet.findAll();
        } catch (err) {
            throw new RepositoryError(`Wallet repository error: ${err.message}`);
        }
    }

    async findById(id: string): Promise<Wallet | null> {
        return await Wallet.findByPk(id);
    }
    
    async deleteById(id: string): Promise<number> {
        return await Wallet.destroy(
            {
                where: {
                    id: id
                }
            });
    }

    async exists(id: string): Promise<boolean> {
        const result = await Wallet.findOne({where: {id: id}});
        return !!result;
    }

    public async getAllForUser(userId: string): Promise<Wallet[] | null>{
        try {
            const wallets = await Wallet.findAll({
                where: { userId: userId },
                include: Expense // Include the associated expenses
            });

            return wallets;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public async getAfterCreate(id: string) {
        return await Wallet.findOne({
            where: { id: id},
            include: Expense
        });
    }
}