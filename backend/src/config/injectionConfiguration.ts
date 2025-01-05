import { UserController } from "../controller/userController.ts";
import { UserRepository } from "../repository/userRepository.ts"
import { WalletRepository } from "../repository/walletRepository.ts";
import { WalletController } from "../controller/walletController.ts";
import { ExpenseController } from "../controller/expenseController.ts";
import { CategoryController } from "../controller/categoryController.ts";
import { BudgetController } from "../controller/budgetsController.ts";
import { GoalController } from "../controller/goalController.ts";
import { ExpenseRepository } from "../repository/expenseRepository.ts";
import { AuthorizationMiddleware} from "../controller/authorization.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { BudgetRepository } from "../repository/budgetRepository.ts";
import { ItemRepository } from "../repository/itemRepository.ts";
import { AvatarRepository } from "../repository/avatarRepository.ts";
import { AccountController } from "../controller/accountController.ts";
import { GoalRepository } from "../repository/goalRepository.ts";
import { AchievementRepository } from "../repository/achievementRepository.ts";
import { AnalyticsController } from "../controller/analyticsController.ts";
import { AccountRepository } from "../repository/accountRepository.ts";
import { AchievementController } from "../controller/achievementController.ts";


import { AccountService } from "../service/accountService.ts";
import { AchievementService } from "../service/achievementService.ts";
import { AnalyticsService } from "../service/analyticsService.ts";
import { BudgetService } from "../service/budgetService.ts";
import { CategoryService } from "../service/categoryService.ts";
import { ExpenseService } from "../service/expenseService.ts";
import { GoalService } from "../service/goalService.ts";
import { UserService } from "../service/userService.ts";
import { WalletService } from "../service/walletService.ts";
import { container } from "../utils/container.ts";
import { ACCOUNT_CONTROLLER, ACHIEVEMENT_CONTROLLER, ANALYTICS_CONTROLLER, ANALYTICS_SERVICE, AUTH_MW, AVATAR_SERVICE, BUDGET_CONTROLLER, CATEGORY_CONTROLLER, EXPENSE_CONTROLLER, GOAL_CONTROLLER, GOAL_SERVICE, ITEM_SERVICE, USER_CONTROLLER, WALLET_CONTROLLER } from "./macros.ts";
import { USER_REPOSITORY, WALLET_REPOSITORY, EXPENSE_REPOSITORY, CATEGORY_REPOSITORY, BUDGET_REPOSITORY, ACCOUNT_REPOSITORY, ITEM_REPOSITORY, AVATAR_REPOSITORY, GOAL_REPOSITORY, ACHIEVEMENT_REPOSITORY, USER_SERVICE, WALLET_SERVICE, EXPENSE_SERVICE, BUDGET_SERVICE, ACCOUNT_SERVICE, ACHIEVEMENT_SERVICE, CATEGORY_SERVICE } from "./macros.ts";
import { AvatarService } from "../service/avatarService.ts";
import { ItemService } from "../service/itemService.ts";

export function configureDI() {
    container.register(AUTH_MW, new AuthorizationMiddleware());

    //Repository registration
    container.register(USER_REPOSITORY, new UserRepository());
    container.register(WALLET_REPOSITORY, new WalletRepository());
    container.register(EXPENSE_REPOSITORY, new ExpenseRepository());
    container.register(CATEGORY_REPOSITORY, new CategoryRepository());
    container.register(BUDGET_REPOSITORY, new BudgetRepository());
    container.register(ACCOUNT_REPOSITORY, new AccountRepository);
    container.register(ITEM_REPOSITORY, new ItemRepository());
    container.register(AVATAR_REPOSITORY, new AvatarRepository());
    container.register(GOAL_REPOSITORY, new GoalRepository());
    container.register(ACHIEVEMENT_REPOSITORY, new AchievementRepository());

    //Service regitration
    container.register(USER_SERVICE, new UserService(
        container.resolve(USER_REPOSITORY)
    ));

    container.register(AVATAR_SERVICE, new AvatarService(
        container.resolve(AVATAR_REPOSITORY)
    ))

    container.register(ACCOUNT_SERVICE, new AccountService(
        container.resolve(ACCOUNT_REPOSITORY)
    ));

    container.register(ITEM_SERVICE, new ItemService(
        container.resolve(ITEM_REPOSITORY),
        container.resolve(ACCOUNT_SERVICE)
    ))

    container.register(ACHIEVEMENT_SERVICE, new AchievementService(
        container.resolve(ACHIEVEMENT_REPOSITORY)
    ));

    container.register(WALLET_SERVICE, new WalletService(
        container.resolve(WALLET_REPOSITORY),
        container.resolve(USER_REPOSITORY),
        container.resolve(EXPENSE_REPOSITORY)
    ));

    container.register(BUDGET_SERVICE, new BudgetService(
        container.resolve(BUDGET_REPOSITORY),
        container.resolve(WALLET_REPOSITORY),
        container.resolve(EXPENSE_REPOSITORY),
        container.resolve(USER_REPOSITORY),
        container.resolve(ACCOUNT_SERVICE)
    ));

    container.register(EXPENSE_SERVICE, new ExpenseService(
        container.resolve(EXPENSE_REPOSITORY),
        container.resolve(WALLET_SERVICE),
        container.resolve(BUDGET_SERVICE),
        container.resolve(USER_REPOSITORY),
        container.resolve(ACCOUNT_SERVICE),
        container.resolve(ACHIEVEMENT_SERVICE)
    ));

    container.register(CATEGORY_SERVICE, new CategoryService(
        container.resolve(CATEGORY_REPOSITORY),
        container.resolve(USER_REPOSITORY),
        container.resolve(WALLET_SERVICE),
        container.resolve(EXPENSE_SERVICE)
    ));

    container.register(GOAL_SERVICE, new GoalService(
        container.resolve(GOAL_REPOSITORY),
        container.resolve(WALLET_SERVICE),
        container.resolve(ACCOUNT_SERVICE),
        container.resolve(ACHIEVEMENT_SERVICE)
    ));

    container.register(ANALYTICS_SERVICE, new AnalyticsService(
        container.resolve(EXPENSE_REPOSITORY),
        container.resolve(CATEGORY_REPOSITORY)
    ));

    //Controller registration
    container.register(USER_CONTROLLER, new UserController(
        container.resolve(USER_SERVICE)
    ));

    container.register(WALLET_CONTROLLER, new WalletController(
        container.resolve(USER_SERVICE),
        container.resolve(WALLET_SERVICE)
    ));

    container.register(EXPENSE_CONTROLLER, new ExpenseController(
        container.resolve(EXPENSE_SERVICE),
        container.resolve(WALLET_SERVICE),
        container.resolve(USER_SERVICE)
    ));

    container.register(CATEGORY_CONTROLLER, new CategoryController(
        container.resolve(USER_SERVICE),
        container.resolve(CATEGORY_SERVICE),
        container.resolve(WALLET_SERVICE)
    ));

    container.register(BUDGET_CONTROLLER, new BudgetController(
        container.resolve(BUDGET_SERVICE),
        container.resolve(USER_SERVICE),
        container.resolve(WALLET_SERVICE),
        container.resolve(EXPENSE_SERVICE)
    ));

    container.register(ACCOUNT_CONTROLLER, new AccountController(
        container.resolve(ACCOUNT_SERVICE),
        container.resolve(ITEM_SERVICE),
        container.resolve(AVATAR_SERVICE)
    ));

    container.register(GOAL_CONTROLLER, new GoalController(
        container.resolve(GOAL_SERVICE),
        container.resolve(WALLET_SERVICE)
    ));

    container.register(ANALYTICS_CONTROLLER, new AnalyticsController(
        container.resolve(ANALYTICS_SERVICE)
    ));

    container.register(ACHIEVEMENT_CONTROLLER, new AchievementController(
        container.resolve(ACHIEVEMENT_SERVICE),
        container.resolve(ACCOUNT_SERVICE)
    ));

}