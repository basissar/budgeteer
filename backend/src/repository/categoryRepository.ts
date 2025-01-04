import { RepositoryError } from "../errors/RepositoryError.ts";
import { Category } from "../model/Category.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';


export class CategoryRepository implements BaseRepository<Category, number> {

    /**
     * Creates new category in database
     * Returns created category
     * @param category
     */
    public async save(category: Category): Promise<Category | null> {
        try {
            const result = await category.save();

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    /**
     * Updates category with provided information
     * @param categoryId id of category to be updated
     * @param updates updated information
     * @returns 
     */
    public async update(categoryId: number, updates: Partial<Category>): Promise<Category | null>{
        const category = await Category.findByPk(categoryId);

        if (!category) {
            return null;
        }

        Object.assign(category, updates);
        await category.save();
        return category;
    }

    public async findAll(): Promise<Category[] | null> {
        return await Category.findAll();
    }

    public async findById(id: number) {
        return await Category.findByPk(id);
    }

    //returns affected rows
    public async deleteById(id: number) {
        return await Category.destroy({
            where: { id }
        });
    }

    public async exists(id: number): Promise<boolean> {
        const result = await Category.findOne({ where: { id } });
        return !!result;
    }

    public async existsByName(name: string): Promise<boolean> {
        const result = await Category.findOne({ where: { name: name } });
        return !!result;
    }

    public async getAllDefault(): Promise<Category[]> {
        try {
            const categories = await Category.findAll({
                where: {
                    walletId: null
                }
            });

            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + (err as Error).message);
        }
    }

    public async getAllForWallet(walletId: string) {
        try {
            const categories = await Category.findAll({
                where: {
                    [Op.or]: [
                        { walletId: walletId },
                        { walletId: null }
                    ]
                }
            });


            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + (err as Error).message);
        }
    }

    public async getCustomForWallet(walletId: string){
        try {
            const categories = await Category.findAll({
                where: {
                    [Op.or]: [
                        { walletId: walletId }
                    ]
                }
            });


            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + (err as Error).message);
        }
    }


}