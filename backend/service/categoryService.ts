import {Category, categorySchema} from "../model/Category.ts";
import {categoryRepo} from "../repository/categoryRepo.ts";
import {userRepo} from "../repository/userRepo.ts";

export class categoryService {
    static async createCategory(category: Category): Promise<Category> {
        try {
            const validatedCategory = categorySchema.parse(category);

            return await categoryRepo.save(validatedCategory);
        } catch (error){
            throw new Error("Validation error: " + error.errors);
        }
    }

    static async getAllCategories(): Promise<Category[]> {
        return await categoryRepo.getAllDefault();
    }

    static async getAllForUser(userId: bigint): Promise<Category[]> {
        const userExists = userRepo.existsById(userId);

        if (!userExists){
            throw new Error("User with id " + userId + " does not exist.");
        }

        const categories = await categoryRepo.getAllForUser(userId);
    }

}