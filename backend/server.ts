import { Application, RouterContext, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { OAuth2Client } from "https://deno.land/x/oauth2@v0.2.6/mod.ts";
import { UserController } from "./src/controller/userController.ts";
import { UserRepository } from "./src/repository/userRepo.ts";
import { UserService } from "./src/service/userService.ts";
import { WalletService } from "./src/service/walletService.ts";
import { WalletRepository } from "./src/repository/walletRepo.ts";
import { WalletController } from "./src/controller/walletController.ts";

import { initializeDatabase } from "./src/database/database.ts";
import { container } from "./src/container.ts";

import { config } from 'https://deno.land/x/dotenv/mod.ts';

container.register("UserRepository", new UserRepository());
container.register("WalletRepository", new WalletRepository());

const server = new Application();
const router = new Router();

server.use(oakCors());

const userController = new UserController();

const walletController = new WalletController();

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

router.post("/budgeteer/user", userController.createUser.bind(userController));

router.get("/budgeteer/users", userController.getAllUsers.bind(userController));

router.get("/budgeteer/users/:username", userController.getUserByUsername);

router.delete("/budgeteer/users/:username", userController.deleteUserByUsername);

// router.post("/budgeteer/categories", createCategory);

// router.get("/budgeteer/categories", getAllCategories);

// router.get("/budgeteer/categories/:id", getAllCategoriesForUser);

router.post("/budgeteer/wallets/", walletController.createWallet);

router.get("/budgeteer/wallets/:userId", walletController.getAllWalletsForUser)

router.get("/budgeteer/wallets/:userId/:walletId", walletController.getWalletForUser)

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

initializeDatabase();