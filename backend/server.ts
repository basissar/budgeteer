import { Application, RouterContext, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { OAuth2Client } from "https://deno.land/x/oauth2@v0.2.6/mod.ts";
import { UserController } from "./src/controller/userController.ts";
import { UserRepository } from "./src/repository/userRepository.ts";
import { WalletRepository } from "./src/repository/walletRepository.ts";
import { WalletController } from "./src/controller/walletController.ts";
import { ExpenseController } from "./src/controller/expenseController.ts";
import { CategoryController } from "./src/controller/categoryController.ts";
import { BudgetController } from "./src/controller/budgetsController.ts";
import { GoalController } from "./src/controller/goalController.ts";

import { initializeDatabase } from "./src/database/database.ts";
import { container } from "./src/utils/container.ts";

// import { config } from 'https://deno.land/x/dotenv/mod.ts';
import { ACCOUNT_SERVICE, ACHIEVEMENT_REPOSITORY, ACHIEVEMENT_SERVICE, AVATAR_REPOSITORY, BUDGET_REPOSITORY, BUDGET_SERVICE, CATEGORY_REPOSITORY, GREEN, ITEM_REPOSITORY, RESET_COLOR, SAVINGS_REPOSITORY, USER_REPOSITORY, USER_SERVICE } from "./src/config/macros.ts";
import { WALLET_REPOSITORY } from "./src/config/macros.ts";
import { EXPENSE_REPOSITORY } from "./src/config/macros.ts";
import { ExpenseRepository } from "./src/repository/expenseRepository.ts";
import authorization from "./src/controller/authorization.ts";
import { CategoryRepository } from "./src/repository/categoryRepository.ts";
import { BudgetRepository } from "./src/repository/budgetRepository.ts";
import { insertData } from "./src/utils/dataInitialization.ts";
import { Scheduler } from "./src/utils/scheduler.ts";
import { AccountService } from "./src/service/accountService.ts";
import { ItemRepository } from "./src/repository/itemRepository.ts";
import { AvatarRepository } from "./src/repository/avatarRepository.ts";
import { AccountController } from "./src/controller/accountController.ts";
import { GoalRepository } from "./src/repository/goalRepository.ts";
import { AchievementRepositroy } from "./src/repository/achievementRepository.ts";
import { AnalyticsController } from "./src/controller/analyticsController.ts";

container.register(USER_REPOSITORY, new UserRepository());
container.register(WALLET_REPOSITORY, new WalletRepository());
container.register(EXPENSE_REPOSITORY, new ExpenseRepository());
container.register(CATEGORY_REPOSITORY, new CategoryRepository());
container.register(BUDGET_REPOSITORY, new BudgetRepository());
container.register(ACCOUNT_SERVICE, new AccountService());
container.register(ITEM_REPOSITORY, new ItemRepository());
container.register(AVATAR_REPOSITORY, new AvatarRepository());
container.register(SAVINGS_REPOSITORY, new GoalRepository());
container.register(ACHIEVEMENT_REPOSITORY, new AchievementRepositroy());


const server = new Application();
const router = new Router();

server.use(oakCors());

const userController = new UserController();

const walletController = new WalletController();

const expenseController = new ExpenseController();

const categoryController = new CategoryController();

const budgetController = new BudgetController();

const accountController = new AccountController();

const savingsController = new GoalController();

const analyticsController = new AnalyticsController();

const oauth2Client = new OAuth2Client({
  clientId: "464adeab29b6617d357a",
  clientSecret: "***",
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  resourceEndpointHost: "https://api.github.com",
  redirectUri: "http://localhost:8000/auth/github/callback",
  defaults: {
    scope: "read:user",
  },
});

router.get<string>("/budgeteer", (ctx: RouterContext<string>) => {
  ctx.response.body = {
    status: "success",
    message: "Budgeteer",
  };
});

router.get("/budgeteer/login", (ctx) => {
  ctx.response.redirect(
    oauth2Client.code.getAuthorizationUri(),
  );
});

/*
router.get("/oauth2/callback", async (ctx) => {
    try {
      // Exchange the authorization code for an access token
      const tokens = await oauth2Client.code.getToken(ctx.request.url);
  
      // Use the access token to make an authenticated API request to GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${tokens.accessToken}`,
        },
      });
  
      if (userResponse.ok) {
        const userData = await userResponse.json();
        ctx.response.body = `Hello, ${userData.name}!`;
      } else {
        ctx.response.body = "Failed to fetch user data from GitHub.";
      }
    } catch (error) {
      ctx.response.body = "Error occurred during OAuth2 callback.";
      console.error(error);
    }
  });
*/

//USER

router.post("/budgeteer/user/login", userController.login.bind(userController));

router.post("/budgeteer/user/register", userController.register.bind(userController));

router.post("/budgeteer/user", userController.createUser.bind(userController));

router.get("/budgeteer/users", userController.getAllUsers.bind(userController));

router.get("/budgeteer/users/:username", userController.getUserByUsername.bind(userController));

router.delete("/budgeteer/users/:username", userController.deleteUserByUsername.bind(userController));

router.get("/userinfo", userController.getUserInfo.bind(userController));

// router.post("/budgeteer/categories", createCategory);

// router.get("/budgeteer/categories", getAllCategories);

// router.get("/budgeteer/categories/:id", getAllCategoriesForUser);

//WALETS
router.post("/budgeteer/:userId/wallets", authorization, walletController.createWallet.bind(walletController));

router.get("/budgeteer/:userId/wallets", authorization, walletController.getAllWalletsForUser.bind(walletController));

router.get("/budgeteer/:userId/wallets/:walletId", authorization, walletController.getWalletForUser.bind(walletController));

router.delete("/budgeteer/:userId/wallets/:walletId", authorization, walletController.deleteWalletForUser.bind(walletController));

//EXPENSES
router.post("/budgeteer/:userId/wallets/:walletId/expenses", authorization, expenseController.createExpense.bind(expenseController));

router.get("/budgeteer/:userId/wallets/:walletId/expenses", authorization, expenseController.getExpensesForWallet.bind(expenseController));

router.get("/budgeteer/:userId/expenses", authorization, expenseController.getAllForUser.bind(expenseController));

router.delete("/budgeteer/:userId/expenses/:expenseId", authorization, expenseController.deleteExpense.bind(expenseController));

router.get("/budgeteer/:userId/categories/:walletId", authorization, categoryController.getAllByWallet.bind(categoryController));

//GOALS
router.post("/budgeteer/:userId/goals/:walletId", authorization, savingsController.createGoal.bind(savingsController));

//TODO might be PUT instead
router.post("/budgeteer/:userId/goals/:walletId/:goalId", authorization, savingsController.updateMoney.bind(savingsController));

router.delete("/budgeteer/:userId/goals/:goalId", authorization, savingsController.deleteGoal.bind(savingsController));

router.get("/budgeteer/:userId/goals/:walletId", authorization, savingsController.getGoalsForWallet.bind(savingsController));


//BUDGETS
router.post("/budgeteer/:userId/budgets/:walletId/", authorization, budgetController.createBudget.bind(budgetController));

router.get("/budgeteer/:userId/budgets/:walletId", authorization, budgetController.getBudgetsForWallet.bind(budgetController));

router.delete("/budgeteer/:userId/budgets/:budgetId", authorization, budgetController.deleteBudget.bind(budgetController));

//ACCOUNT,ITEM,AVATAR for beter handling all contained in the AccountController
router.post("/budgeteer/:userId/account", authorization, accountController.createAccount.bind(accountController));

router.get("/budgeteer/:userId/account", authorization, accountController.getAccount.bind(accountController));

router.post("/budgeteer/:userId/buy/:itemId", authorization, accountController.buyItem.bind(accountController));

router.post("/budgeteer/:userId/equip/:itemId", authorization, accountController.equipItem.bind(accountController));

router.post("/budgeteer/:userId/unequip/:itemId", authorization, accountController.unequipItem.bind(accountController));

router.get("/budgeteer/avatars/:avatarId", authorization, accountController.getAvatarItems.bind(accountController));

router.get("/budgeteer/avatars", authorization, accountController.getAllAvatars.bind(accountController));

//ANALYTICS
router.post("/budgeteer/analytics/:userId/sumNegative", authorization, analyticsController.getSumNegativeForMonth.bind(analyticsController))

router.post("/budgeteer/analytics/:userId/sumNegativeRange", authorization, analyticsController.getSumNegativeForRange.bind(analyticsController));

router.get("/budgeteer/analytics/:userId/:walletId", authorization, analyticsController.getCurrentWalletBalance.bind(analyticsController));

server.use(router.routes());
server.use(router.allowedMethods());

server.addEventListener("listen", ({ port, secure }) => {
  console.log(
    `Server started on ${secure ? "https://" : "http://"}localhost:${port}`
  );
});

server.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.body = "Internal Server Error";
    ctx.response.status = 500;
  }
});

const port = 8000;

server.listen({ port });

initializeDatabase().then(() => {
  insertData().then(() => {
    console.log(GREEN, "Data created successfully.", RESET_COLOR);
  }).catch((error) => {
    console.error("Failed to save data:", error);
  });
}).catch((error) => {
  console.error("Database initialization failed:", error);
}).then(() => {
  // Start the scheduler...
  const scheduler = new Scheduler(container.resolve(USER_SERVICE), container.resolve(BUDGET_SERVICE), container.resolve(ACCOUNT_SERVICE), container.resolve(ACHIEVEMENT_SERVICE));
  scheduler.start();
});



