// import Wallet from "../database/exDatabase.ts";
import {Wallet} from "../model/Wallet.ts";
import { BaseRepository } from "./baseRepository.ts";

export class WalletRepository implements BaseRepository<Wallet> {
    
    async save(wallet: Wallet): Promise<Wallet | null> {
        try {
            const newWallet = new Wallet(
                {
                    id: wallet.id,
                    userId: wallet.userId,
                    name: wallet.name
                }
            );

            console.log(newWallet);

            const result = await newWallet.save();

            console.log(result);

            return result;
        } catch (error){
            console.log(error);
            return null;
        }
    }

    async findAll(): Promise<Wallet[] | null> {
        return await Wallet.findAll();
    }

    async findById(id: number): Promise<Wallet | null> {
        return await Wallet.findByPk(id);
    }
    
    async deleteById(id: number): Promise<number> {
        return await Wallet.destroy(
            {
                where: {
                    id: id
                }
            });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Wallet.findOne({where: {id: id}});
        return !!result;
    }

    public async getAllForUser(userId: number): Promise<Wallet[] | null>{
        try {
            const wallets = await Wallet.findAll({where: {userId: userId}});

            return wallets;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}