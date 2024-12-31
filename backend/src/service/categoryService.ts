import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Category } from "../model/Category.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { WalletService } from "./walletService.ts";

export class CategoryService {

    private categoryRepo: CategoryRepository;

    private userRepo: UserRepository;

    private walletService: WalletService;

    constructor(categoryRepository: CategoryRepository, userRepository: UserRepository, walletService: WalletService){
        this.categoryRepo = categoryRepository;
        this.userRepo = userRepository;
        this.walletService = walletService;
    }

    async createCategory(category: Category): Promise<Category | null> {
        //no need for existence check as we allow multiple cats with same name
        return await this.categoryRepo.save(category);
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            return await this.categoryRepo.getAllDefault();
        } catch (e){
            throw new ServiceError("Category service error: " + e.message);
        }
    }

    async getAllForUser(userId: string): Promise<Category[] | null> {
        const userExists = await this.userRepo.existsById(userId);

        if (!userExists){
            return null;
        }

        return await this.categoryRepo.getAllForUser(userId);
    }

    /**
     * Retrieves all categories for user in specific wallet
     * @param userId 
     * @param walletId target wallet
     * @returns 
     */
    async getAllForUserInWallet(userId: string, walletId: string){
        try {
            const userExists = await this.userRepo.exists(userId);

            if (!userExists) {
                throw new NotFoundError(`User ${userId} does not exist`);
            }

            const belongsToUser = await this.walletService.belongsToUser(userId, walletId);

            if(!belongsToUser) {
                throw new ServiceError(`Wallet does not belong to user`);
            }

            const categories = await this.categoryRepo.getAllforUserInWallet(walletId);
            return categories;
        } catch (err) {
            throw new ServiceError(`Category service error: ${err.message}`);
        }
    }

    async deleteCategoryForUser(categoryId: number, userId: string): Promise<boolean> {
        try {
            const userExists = await this.userRepo.exists(userId);

            if(!userExists) {
                throw new NotFoundError(`User ${userId} does not exist`);
            }
    
            const category = await this.categoryRepo.findById(categoryId);
            if(!category) {
                throw new NotFoundError(`Category with ${categoryId} does not exist`);
            }
    
            if (category.userId !== userId && category.userId !== null) {
                throw new Error('Category does not belong to the user.');
            }
    
            return await this.categoryRepo.deleteById(categoryId) != 0;
        } catch (err){
            throw new ServiceError(`Category service error: error deleting category ${err.message}`); 
        }
    }

}