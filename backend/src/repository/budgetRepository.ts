import { BaseRepository } from "./baseRepository.ts";
import { Budget } from "../model/Budget.ts";
import { Category } from "../model/Category.ts";


export class BudgetRepository implements BaseRepository<Budget, number> {
    
    async save(budget: Budget): Promise<Budget | null> {
        try {
            const result = await budget.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Budget repository error: ${err}`);
        }
    }

    async findAll(): Promise<Budget[] | null> {
        return await Budget.findAll();
    }

    async findById(id: number): Promise<Budget | null> {
        return await Budget.findByPk(id);
    }

    async deleteById(id: number): Promise<number> {
        return await Budget.destroy({
            where:{id}
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Budget.findOne({where: {id}});
        return !!result;
    }

    async findByWallet(walletId: string): Promise<Budget[] | null> {
        return await Budget.findAll({
            where: {
                walletId: walletId
            },
            include: [
                {model: Category, as: 'category', attributes:['name','color']}
            ]
        })
    }

    async findByWalletAndCategory(walletId: string, categoryId: number): Promise<Budget[] | null> {
        return await Budget.findAll({
            where: {
                walletId: walletId,
                categoryId: categoryId
            },
            include: [
                {model: Category, as: 'category', attributes:['name','color']}
            ]
        });
    }
}