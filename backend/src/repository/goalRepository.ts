import { RepositoryError } from "../errors/RepositoryError.ts";
import { Category } from "../model/Category.ts";
import { Goal } from "../model/Goal.ts";
import { Wallet } from "../model/Wallet.ts";
import { BaseRepository } from "./baseRepository.ts";


export class GoalRepository implements BaseRepository<Goal, number> {

    async save(goal: Goal): Promise<Goal | null> {
        try {
            const result = await goal.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Savings repository error: ${err.message}`);
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
                {model: Category, as: 'category', attributes: ['name','color']}
            ]
        });
    }

    async deleteById(id: number): Promise<number> {
        return await Goal.destroy({
            where: { id: id }
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Goal.findOne({ 
            where: {id: id}
        });

        return !!result;
    }

    async findByWallet(walletId: string): Promise<Goal[] | null> {
        return await Goal.findAll({
            where: {
                walletId: walletId,
            },
            include: [
                {model: Category, as: 'category', attributes:['name', 'color']},
            ]
        });
    }

    async countCompleted(userId: string) {
        const completedGoals = await Goal.count({
            where : {completed: true},
            include: [
                {
                    model: Wallet,
                    as: 'wallet',
                    where: {userId: userId}
                }
            ]
        });

        return completedGoals;
    }
}