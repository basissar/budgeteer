import { Application, RouterContext, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { OAuth2Client } from "https://deno.land/x/oauth2@v0.2.6/mod.ts";
import { UserController } from "./src/controller/userController.ts";
import { UserRepository } from "./src/repository/userRepo.ts";
import { WalletRepository } from "./src/repository/walletRepo.ts";
import { WalletController } from "./src/controller/walletController.ts";
import { ExpenseController } from "./src/controller/expenseController.ts";
import { CategoryController } from "./src/controller/categoryController.ts";

import { initializeDatabase } from "./src/database/database.ts";
import { container } from "./src/container.ts";

// import { config } from 'https://deno.land/x/dotenv/mod.ts';
import { CATEGORY_REPOSITORY, USER_REPOSITORY } from "./src/config/macros.ts";
import { WALLET_REPOSITORY } from "./src/config/macros.ts";
import { EXPENSE_REPOSITORY } from "./src/config/macros.ts";
import { ExpenseRepository } from "./src/repository/expenseRepo.ts";
import authorization from "./src/controller/authorization.ts";
import { CategoryRepository } from "./src/repository/categoryRepo.ts";
import { saveDefaultCategories } from "./src/utils/initializationCat.ts";

container.register(USER_REPOSITORY, new UserRepository());
container.register(WALLET_REPOSITORY, new WalletRepository());
container.register(EXPENSE_REPOSITORY, new ExpenseRepository());
container.register(CATEGORY_REPOSITORY, new CategoryRepository());

const server = new Application();
const router = new Router();

server.use(oakCors());

const userController = new UserController();

const walletController = new WalletController();

const expenseController = new ExpenseController();

const categoryController = new CategoryController();

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

router.post("/budgeteer/:userId/wallets", authorization, walletController.createWallet.bind(walletController));

router.get("/budgeteer/:userId/wallets", authorization, walletController.getAllWalletsForUser.bind(walletController));

router.get("/budgeteer/:userId/wallets/:walletId", authorization, walletController.getWalletForUser.bind(walletController));

router.delete("/budgeteer/:userId/wallets/:walletId", authorization, walletController.deleteWalletForUser.bind(walletController));

router.post("/budgeteer/:userId/wallets/:walletId/expenses", authorization, expenseController.createExpense.bind(expenseController));

router.get("/budgeteer/:userId/wallets/:walletId/expenses", authorization, expenseController.getExpensesForWallet.bind(expenseController));

router.get("/budgeteer/:userId/expenses", authorization, expenseController.getAllForUser.bind(expenseController));

router.get("/budgeteer/:userId/categories/:walletId", authorization, categoryController.getAllByWallet.bind(categoryController));

// router.delete("/budgeteer/wallets/:id", deleteWalletForUser)

server.use(router.routes());
server.use(router.allowedMethods());

server.addEventListener("listen", ({port, secure}) => {
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

server.listen({port});

// initializeDatabase();

//Initialize database and save default categories
// initializeDatabase().then(() => {
//   saveDefaultCategories().then(() => {
//       console.log("Default categories saved successfully.");
//   }).catch((error) => {
//       console.error("Failed to save default categories:", error);
//   });
// }).catch((error) => {
//   console.error("Database initialization failed:", error);
// });

initializeDatabase().catch(error => {
  console.error("Failed to initialize database:", error);
})