import { Category } from "../model/Category.ts";
import { CategoryRepository } from "../repository/categoryRepo.ts";
import { UserRepository } from "../repository/userRepo.ts";

export class CategoryService {

    constructor(private readonly categoryRepo: CategoryRepository,
        private readonly userRepo: UserRepository){}

    async createCategory(category: Category): Promise<Category | null> {
        return await this.categoryRepo.save(category);
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            return await this.categoryRepo.getAllDefault();
        } catch (e){
            throw new Error(e);
        }
    }

    async getAllForUser(userId: string): Promise<Category[] | null> {
        const userExists = await this.userRepo.existsById(userId);

        if (!userExists){
            throw new Error("User with id " + userId + " does not exist.");
        }

        return await this.categoryRepo.getAllForUser(userId);
    }

    async deleteCategoryForUser(categoryId: number, userId: string): Promise<boolean> {
        try {
            const userExists = await this.userRepo.exists(userId);

            if(!userExists) {
                throw new Error(`User ${userId} does not exist`);
            }
    
            const category = await this.categoryRepo.findById(categoryId);
            if(!category) {
                throw new Error(`Category with ${categoryId} does not exist`);
            }
    
            if (category.userId !== userId && category.userId !== null) {
                throw new Error('Category does not belong to the user.');
            }
    
            return await this.categoryRepo.deleteById(categoryId) != 0;
        } catch (err){
            throw new Error("Error deleting category: " + err);
        }
    }

}