import { RepositoryError } from "../errors/RepositoryError.ts";
import {Category} from "../model/Category.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';


export class CategoryRepository implements BaseRepository<Category, number> {
    
    
    /**
     * Creates new category in database
     * Returns created category
     * @param category
     */
    async save(category: Category) {
        try {
            const result = await category.save();

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async findAll(): Promise<Category[] | null> {
        return await Category.findAll();
    }

    async findById(id: number) {
        return await Category.findByPk(id);
    }

    //returns affected rows
    async deleteById(id: number) {
        return await Category.destroy({
            where:{id}
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Category.findOne({where: {id}});
        return !!result;
    }

    /**
     * Theoretically a useless query as we won't ever need to know all the categories.
     *
     */
    /*
    static async getAllCategories(): Promise<Category[]> {
        const result = await Database.client!.queryObject<Category[]>(
            "SELECT * FROM categories");

        return result.rows.map((row) => ({
            id: Number(row.id),
            name: row.name,
            userId: Number(row.userId),
        }))
    }
    */

    /**
     * Returns all categories for user with given id; that is all default categories and
     * user created categories.
     * @param id identificator by which we query the categories
     */
    async getAllForUser(id: string): Promise<Category[] | null> {
        try {
            const categories = await Category.findAll({
                where: { 
                    [Op.or]: [
                        {userId: id},
                        {userId: null}
                    ]
                }
            });

            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + err);
        }
    }

    async getAllDefault(): Promise<Category[]> {
        try {
            const categories = await Category.findAll({
                where: {
                    userId: null
                }
            });

            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + err);
        }
    }

    async getAllforUserInWallet(userId: string, walletId: string){
        try {
            const categories = await Category.findAll({
                where: {
                    [Op.and] : [
                        { walletId: walletId},
                        { [Op.or] : [
                            {userId: null},
                            {userId: userId}
                        ]}
                    ]
                }
            });

            return categories;
        } catch (err) {
            throw new RepositoryError("Category repository error: " + err.message);
        }
    }


}