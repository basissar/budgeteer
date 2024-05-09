import { Category } from "../model/Category.ts";
import { Goal } from "../model/Goal.ts";
import { BaseRepository } from "./baseRepository.ts";


export class GoalRepository implements BaseRepository<Goal, number> {

    async save(goal: Goal): Promise<Goal | null> {
        try {
            const result = await goal.save();

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async findAll(): Promise<Goal[] | null> {
        return await Goal.findAll();
    }

    async findById(id: number): Promise<Goal | null> {
        return await Goal.findByPk(id);
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
}