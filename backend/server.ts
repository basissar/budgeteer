import { Application, RouterContext, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
//import { userRepo } from "./repository/userRepo.ts";
import {createUser, deleteUserByUsername} from "./routing/userRouting.ts";
import { getAllUsers } from "./routing/userRouting.ts";
import { getUserByUsername } from "./routing/userRouting.ts"
import {createCategory, getAllCategories, getAllCategoriesForUser} from "./routing/categoryRouting.ts";
import {Recurrence} from "./model/Recurrence.ts";
import {ItemRarity} from "./model/ItemRarity.ts";

const server = new Application();
const router = new Router();

router.get<string>("/budgeteer", (ctx: RouterContext<string>) => {
    ctx.response.body = {
        status: "success",
        message: "Budgeteer",
    };
});

router.post("/budgeteer/user", createUser);

router.get("/budgeteer/users", getAllUsers);

router.get("/budgeteer/users/:username", getUserByUsername);

router.delete("/budgeteer/users/:username", deleteUserByUsername);

router.post("/budgeteer/categories", createCategory);

router.get("/budgeteer/categories", getAllCategories);

router.get("/budgeteer/categories/:id", getAllCategoriesForUser);


server.use(router.routes());
server.use(router.allowedMethods());

server.addEventListener("listen", ({port, secure}) => {
    console.log(
        `Server started on ${secure ? "https://" : "http://"}localhost:${port}`
    );
});

const port = 8000;

server.listen({port});