import { NotFoundError } from "../errors/NotFoundError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { Category } from "../model/Category.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { UserRepository } from "../repository/userRepository.ts";
import { ExpenseService } from "./expenseService.ts";
import { WalletService } from "./walletService.ts";

export class CategoryService {

    private categoryRepo: CategoryRepository;

    private userRepo: UserRepository;

    private walletService: WalletService;

    private expenseService: ExpenseService;

    constructor(categoryRepository: CategoryRepository, userRepository: UserRepository, walletService: WalletService, expenseService: ExpenseService) {
        this.categoryRepo = categoryRepository;
        this.userRepo = userRepository;
        this.walletService = walletService;
        this.expenseService = expenseService;
    }

    public async createCategory(category: Category): Promise<Category | null> {
        //no need for existence check as we allow multiple cats with same name
        return await this.categoryRepo.save(category);
    }

    /**
     * Retrieves all categories for user in specific wallet
     * @param walletId target wallet
     * @returns 
     */
    public async getAllForWallet(walletId: string) {
        const walletExists = await this.walletService.exists(walletId);
        if (!walletExists) {
            throw new ServiceError(`Wallet does not exist.`);
        }

        try {
            return await this.categoryRepo.getAllForWallet(walletId);
        } catch (err) {
            throw new ServiceError(`Error retrieving categories for wallet ${err}`);
        }
    }

    /**
     * Retrieves custom categories only for wallet
     * @param walletId wanted wallet id
     * @returns 
     */
    public async getCustomForWallet(walletId: string) {
        const walletExists = await this.walletService.exists(walletId);

        if (!walletExists) {
            throw new ServiceError(`Wallet does not exist.`);
        }

        try {
            return await this.categoryRepo.getCustomForWallet(walletId);
        } catch (err) {
            throw new ServiceError(`Error retrieving categories for wallet ${err}`);
        }
    }

    /**
     * Retrieves all default categories
     */
    public async getAllDefault() {
        try {
            const defaultCategories = await this.categoryRepo.getAllDefault();

            if (defaultCategories.length == 0) {
                throw new ServiceError(`No default categories retrieved`);
            }

            return defaultCategories;
        } catch (error) {
            throw new ServiceError(`Category service error: ${(error as Error).message}`);
        }

    }

    /**
     * Deletes a category
     * @param categoryId of category to be deleted
     * @returns 
     */
    public async deleteCategory(categoryId: number): Promise<boolean> {
        if (categoryId >= 0 && categoryId <= 11) {
            //trying to delete a default category is not allowed
            throw new UnauthorizedError(`Deleting a default category (id: ${categoryId}) is not allowed.`);
        }

        const category = await this.categoryRepo.findById(categoryId);

        if (!category) {
            throw new NotFoundError(`Category with ${categoryId} does not exist`);
        }

        try {
            await this.expenseService.deleteAllInCategory(category.walletId!, category.id);
        } catch (error) {
            throw new ServiceError(`Category service error: ${(error as Error).message}`);
        }

        return await this.categoryRepo.deleteById(categoryId) != 0;
    }

    /**
     * Updates category with provided information
     * @param categoryId id of category to be updated
     * @param userId id of user owning the wallet category is in - used for ownership check
     * @param updates updated information for category
     * @returns 
     */
    public async udpateCategory(categoryId: number, userId: string, updates: Partial<Category>) {
        const foundCategory = await this.categoryRepo.findById(categoryId);

        if (!foundCategory) {
            throw new NotFoundError(`Category with id ${categoryId} not found.`);
        }

        //we cannot update default categories so it always has a walletId
        const belongsToUser = await this.walletService.belongsToUser(userId, foundCategory.walletId!);

        if (!belongsToUser) {
            throw new UnauthorizedError(`Unauthorized access to category editaion.`);
        }

        return await this.categoryRepo.update(categoryId, updates);
    }

}