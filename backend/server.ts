import { Application, RouterContext, Router } from "@oak/oak";

import "jsr:@std/dotenv/load";

import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { OAuth2Client } from "https://deno.land/x/oauth2@v0.2.6/mod.ts";

import { initializeDatabase } from "./src/database/database.ts";
import { container } from "./src/utils/container.ts";

import { ACCOUNT_CONTROLLER, ACCOUNT_SERVICE, ACHIEVEMENT_CONTROLLER, ACHIEVEMENT_SERVICE, ANALYTICS_CONTROLLER, AUTH_MW, BUDGET_CONTROLLER, BUDGET_SERVICE, CATEGORY_CONTROLLER, EXPENSE_CONTROLLER, GOAL_CONTROLLER, USER_CONTROLLER, USER_SERVICE, WALLET_CONTROLLER } from "./src/config/macros.ts";

import { Scheduler } from "./src/utils/scheduler.ts";
import { configureDI } from "./src/config/injectionConfiguration.ts";

configureDI();

const authorizationMiddleware = container.resolve(AUTH_MW);

const server = new Application();
const router = new Router();

server.use(oakCors({
  credentials: true,
  origin: /^.+localhost:(3000|4200|8080)$/
}));

const userController = container.resolve(USER_CONTROLLER);

const walletController = container.resolve(WALLET_CONTROLLER);

const expenseController = container.resolve(EXPENSE_CONTROLLER);

const categoryController = container.resolve(CATEGORY_CONTROLLER);

const budgetController = container.resolve(BUDGET_CONTROLLER);

const accountController = container.resolve(ACCOUNT_CONTROLLER);

const savingsController = container.resolve(GOAL_CONTROLLER);

const analyticsController = container.resolve(ANALYTICS_CONTROLLER);

const achievementController = container.resolve(ACHIEVEMENT_CONTROLLER);

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

//USER

router.post("/budgeteer/user/login", userController.login.bind(userController));

router.post("/budgeteer/user/register", userController.register.bind(userController));

router.post("/budgeteer/user", userController.createUser.bind(userController));

router.post("/budgeteer/user/logout", userController.logout.bind(userController));

// router.get("/budgeteer/user/refresh", userController.restoreSession.bind(userController));

router.use(authorizationMiddleware.handle.bind(authorizationMiddleware));

router.post("/budgeteer/user/update", userController.updateUser.bind(userController));

router.get("/budgeteer/users", userController.getAllUsers.bind(userController));

router.get("/budgeteer/users/:username", userController.getUserByUsername.bind(userController));

router.delete("/budgeteer/users", userController.deleteUser.bind(userController));

// router.get("/userinfo", userController.getUserInfo.bind(userController));

// router.post("/budgeteer/categories", createCategory);

// router.get("/budgeteer/categories", getAllCategories);

// router.get("/budgeteer/categories/:id", getAllCategoriesForUser);

//WALETS
router.post("/budgeteer/:userId/wallets", walletController.createWallet.bind(walletController));

router.get("/budgeteer/:userId/wallets", walletController.getAllWalletsForUser.bind(walletController));

router.get("/budgeteer/:userId/wallets/:walletId", walletController.getWalletForUser.bind(walletController));

router.delete("/budgeteer/:userId/wallets/:walletId", walletController.deleteWalletForUser.bind(walletController));

//EXPENSES
router.post("/budgeteer/:userId/wallets/:walletId/expenses", expenseController.createExpense.bind(expenseController));

router.get("/budgeteer/:userId/wallets/:walletId/expenses", expenseController.getExpensesForWallet.bind(expenseController));

router.get("/budgeteer/:userId/expenses", expenseController.getAllForUser.bind(expenseController));

router.delete("/budgeteer/:userId/expenses/:expenseId", expenseController.deleteExpense.bind(expenseController));

router.get("/budgeteer/:userId/categories/:walletId", categoryController.getAllByWallet.bind(categoryController));

//GOALS
router.post("/budgeteer/:userId/goals/:walletId", savingsController.createGoal.bind(savingsController));

//TODO might be PUT instead
router.post("/budgeteer/:userId/goals/:walletId/:goalId", savingsController.updateMoney.bind(savingsController));

router.delete("/budgeteer/:userId/goals/:goalId", savingsController.deleteGoal.bind(savingsController));

router.get("/budgeteer/:userId/goals/:walletId", savingsController.getGoalsForWallet.bind(savingsController));


//BUDGETS
router.post("/budgeteer/:userId/budgets/:walletId/", budgetController.createBudget.bind(budgetController));

router.get("/budgeteer/:userId/budgets/:walletId", budgetController.getBudgetsForWallet.bind(budgetController));

router.delete("/budgeteer/:userId/budgets/:budgetId", budgetController.deleteBudget.bind(budgetController));

//ACCOUNT,ITEM,AVATAR for beter handling all contained in the AccountController
router.post("/budgeteer/:userId/account", accountController.createAccount.bind(accountController));

router.get("/budgeteer/:userId/account", accountController.getAccount.bind(accountController));

router.post("/budgeteer/:userId/buy/:itemId", accountController.buyItem.bind(accountController));

router.post("/budgeteer/:userId/equip/:itemId", accountController.equipItem.bind(accountController));

router.post("/budgeteer/:userId/unequip/:itemId", accountController.unequipItem.bind(accountController));

router.get("/budgeteer/avatars/:avatarId", accountController.getAvatarItems.bind(accountController));

router.get("/budgeteer/avatars", accountController.getAllAvatars.bind(accountController));

//ACHIEVEMENTS
router.get("/budgeteer/achievements/:userId", achievementController.getAllAchievementsForUser.bind(achievementController));

router.get("/budgeteer/achievements", achievementController.getAllAchievements.bind(achievementController));

router.post("/budgeteer/achievements/:userId/:achievementId", achievementController.claimAchievement.bind(achievementController));

//ANALYTICS
router.post("/budgeteer/analytics/:userId/:walletId/sumNegative", analyticsController.getSumNegativeForMonth.bind(analyticsController))

router.post("/budgeteer/analytics/:userId/:walletId/sumPositive", analyticsController.getSumPositiveForMonth.bind(analyticsController))

router.post("/budgeteer/analytics/:userId/sumNegativeRange", analyticsController.getSumNegativeForRange.bind(analyticsController));

router.get("/budgeteer/analytics/:userId/:walletId", analyticsController.getCurrentWalletBalance.bind(analyticsController));

router.get("/budgeteer/analytics/:walletId", analyticsController.getTotalWalletBalance.bind(analyticsController));

router.get("/budgeteer/analytics/:walletId/:startDate/:endDate", analyticsController.getSumsForDateRange.bind(analyticsController));

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
    ctx.response.body = { message: "Internal Server Error: " + err };
    ctx.response.status = 500;
  }
});

const port = Number(Deno.env.get("PORT"));

server.listen({ port });

initializeDatabase()
  .then(() => {
    const scheduler = new Scheduler(
      container.resolve(USER_SERVICE),
      container.resolve(BUDGET_SERVICE),
      container.resolve(ACCOUNT_SERVICE),
      container.resolve(ACHIEVEMENT_SERVICE)
    );
    scheduler.start();
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
  });



