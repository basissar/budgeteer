import { Sequelize } from "npm:sequelize-typescript";
import { container } from "../../src/utils/container.ts";
import { ACCOUNT_REPOSITORY } from "../../src/config/macros.ts";
import { AccountRepository } from "../../src/repository/accountRepository.ts";
import { UserRepository } from "../../src/repository/userRepository.ts";
import { User } from "../../src/model/User.ts";
import { Wallet } from "../../src/model/Wallet.ts";
import { Category } from "../../src/model/Category.ts";
import { Budget } from "../../src/model/Budget.ts";
import { Goal } from "../../src/model/Goal.ts";
import { Expense } from "../../src/model/Expense.ts";
import { Avatar } from "../../src/model/Avatar.ts";
import { Account } from "../../src/model/Account.ts";
import { Item } from "../../src/model/Item.ts";
import { sequelize } from "../../src/database/database.ts";
import { ItemRarity } from "../../src/model/ItemRarity.ts";
import { assert } from "https://deno.land/std@0.200.0/assert/assert.ts";
import pg from 'npm:pg';
import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";
import { ItemAvatar } from "../../src/model/ItemAvatar.ts";
import { ItemOwned } from "../../src/model/ItemOwned.ts";

Deno.test("Successfull account creation", async (t) => {

    await t.step("Preparation phase", async (t) => {
        const sequelize = new Sequelize({
            database: 'postgres',
            username: 'postgres',
            password: 'password',
            host: 'localhost',
            port: 5432,
            dialect: 'postgres',
            dialectModule: pg,
        });

        const accountRepo = new AccountRepository();

        container.register(ACCOUNT_REPOSITORY, accountRepo);

        await delay(100);

        await sequelize.authenticate();
        console.log("Authenticated");
        sequelize.addModels([User, Account, Wallet, Category, Budget, Goal, Expense, Avatar, Item, ItemOwned, ItemAvatar]);

        await sequelize.sync();
        console.log('Models synchronized successfullly');

        const user = new User({
            username: "username",
            email: "user@email.com",
            password: "password",
            timezone: "Europe/Prague"
        });

        await user.save();
        console.log("User saved into database");

        const avatar = new Avatar({
            name: 'dog',
            description: "this avatar is a dog"
        });

        await avatar.save()
        console.log("Avatar saved into database");

        const account = new Account({
            experience: 0,
            credits: 0,
            level: 0,
            userId: user.id,
            avatarId: avatar.id
        });

        await account.save();
        console.log("Account saved into database");

        const item1 = new Item({
            name: "item1",
            price: 10,
            rarity: ItemRarity.common,
            avatarId: avatar.id
        });

        const item2 = new Item({
            name: "item2",
            price: 30,
            rarity: ItemRarity.epic,
            avatarId: avatar.id
        });

        const item3 = new Item({
            name: "item3",
            price: 50,
            rarity: ItemRarity.rare,
            avatarId: avatar.id
        });

        await item1.save();
        await item2.save();
        await item3.save();

        console.log("Items saved");

        const itemAcc1 = new ItemOwned({
            itemId: item1.id,
            accountId: account.id
        });

        const itemAcc2 = new ItemOwned({
            itemId: item2.id,
            accountId: account.id
        });

        await itemAcc1.save();
        await itemAcc2.save();

        console.log("Items added to accound");

        const itemsForAcconut = await accountRepo.getItemsOwnedForAccount(account.id);

        assert(itemsForAcconut != null);

        for (const it of itemsForAcconut){
            console.log(`Item: ${it.name} ${it.rarity} for ${it.price} credits`);
        }

        await t.step("Database cleanup", async () => {
            await sequelize.drop();
            await sequelize.close();
        })
    });



});