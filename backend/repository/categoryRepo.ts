import {Category} from "../model/Category.ts";
import Database from "../database/database.ts";


export class categoryRepo {

    /**
     * Creates new category in database
     * Returns created category
     * @param category
     */
    static async save(category: Category): Promise<Category> {
        try {
            await Database.client!.queryObject<Category>(
                "INSERT INTO categories (id,name, \"userId\") VALUES ($1, $2, $3)",
                [category.id, category.name, category.userId]
            );

            return category;
        } catch (error){
            throw error;
        }
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
    static async getAllForUser(id: bigint): Promise<Category[]> {
        const result = await Database.client!.queryObject<Category[]>(
            "SELECT * FROM categories WHERE \"userId\" IS NULL OR \"userId\" = $1 ",
            [id]);

        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            userId: row.userId,
        }))
    }

    static async getAllDefault(): Promise<Category> {
        const result = await Database.client!.queryObject<Category>(
            "SELECT * FROM categories WHERE userId IS NULL"
        );

        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            userId: row.userId,
        }));
    }


    /*

    static async getCategoryById();

     */

}