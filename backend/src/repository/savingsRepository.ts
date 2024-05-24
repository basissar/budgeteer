import { Category } from "../model/Category.ts";
import { Goal } from "../model/Goal.ts";
import { BaseRepository } from "./baseRepository.ts";

export class SavingsRepository implements BaseRepository<Goal, number> {
    
    async save(goal: Goal): Promise<Goal | null> {
        try {
            const result = await goal.save();
            
            return result;
        } catch (err) {
            //todo handling errors

            console.log(err);
            return null;
        }
    }

    async findAll(): Promise<Goal[] | null> {
        return await Goal.findAll();
    }

    async findById(id: number): Promise<Goal | null> {
        return await Goal.findOne({
            where:{
                id: id
            },
            include: [
                {model: Category, as: 'category', attributes: ['name','category']};
            ]
        });
    }

    async deleteById(id: number): Promise<number> {
        return await Goal.destroy({
            where: {id}
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Goal.findOne({
            where: {id}
        });

        return !!result;
    }

    async findByWallet(walletId: string): Promise<Goal[] | null>{
        return await Goal.findAll({
            where: {
                walletId: walletId
            }
        });
    }

    async findByWalletAndCategory(walletId: string, categoryId: number): Promise<Goal[] | null> {
        return await Goal.findAll({
            where: {
                walletId: walletId,
                categoryId: categoryId,
            },
            include: [
                {model: Category, as: 'category', attributes: ['name','color']}
            ]
        });
    }

    

}