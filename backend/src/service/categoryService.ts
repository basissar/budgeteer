import { CATEGORY_REPOSITORY, USER_REPOSITORY, WALLET_SERVICE } from "../config/macros.ts";
import { container } from "../container.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Category } from "../model/Category.ts";
import { CategoryRepository } from "../repository/categoryRepo.ts";
import { UserRepository } from "../repository/userRepo.ts";
import { WalletService } from "./walletService.ts";

export class CategoryService {

    private categoryRepo: CategoryRepository;

    private userRepo: UserRepository;

    private walletService: WalletService;

    constructor(){
        const catRep = container.resolve(CATEGORY_REPOSITORY);

        const userRep = container.resolve(USER_REPOSITORY);

        const wallSer = container.resolve(WALLET_SERVICE);
        
        if(catRep == null){
            const newCatRep = new CategoryRepository();
            container.register(newCatRep, CATEGORY_REPOSITORY);
            this.categoryRepo = newCatRep;
        } else {
            this.categoryRepo = catRep;
        }

        if (userRep == null) {
            const newUserRep = new UserRepository();
            container.register(newUserRep, USER_REPOSITORY);
            this.userRepo = newUserRep;
        } else {
            this.userRepo = userRep;
        }

        if(wallSer == null) {
            const newWallSer = new WalletService();
            container.register(newWallSer, WALLET_SERVICE);
            this.walletService = newWallSer;
        } else {
            this.walletService = wallSer;
        }
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
            throw new NotFoundError("User with id " + userId + " does not exist.");
        }

        return await this.categoryRepo.getAllForUser(userId);
    }

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

            const categories = await this.categoryRepo.getAllforUserInWallet(userId, walletId);
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