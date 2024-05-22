import { Sequelize } from "npm:sequelize-typescript";
import { Category } from "../../src/model/Category.ts";
import { Account } from "../../src/model/Account.ts";
import { Avatar } from "../../src/model/Avatar.ts";
import { Budget } from "../../src/model/Budget.ts";
import { Expense } from "../../src/model/Expense.ts";
import { Goal } from "../../src/model/Goal.ts";
import { Item } from "../../src/model/Item.ts";
import { ItemAvatar } from "../../src/model/ItemAvatar.ts";
import { ItemEquipped } from "../../src/model/ItemEquipped.ts";
import { ItemOwned } from "../../src/model/ItemOwned.ts";
import { User } from "../../src/model/User.ts";
import { Wallet } from "../../src/model/Wallet.ts";
import { AccountAchievement } from "../../src/model/AccountAchievement.ts";
import { Achievement } from "../../src/model/Achievement.ts";
import pg from 'npm:pg';

let sequelize: Sequelize;

export async function setupDatabase(){

    sequelize = new Sequelize({
        database: 'postgres', 
        username: 'postgres',
        password: 'password',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        dialectModule: pg,
        // models: [Category, Account, User, Wallet, Expense, Budget, Goal, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar, Achievement, AccountAchievement],
      });

      await sequelize.addModels([Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar, Achievement, AccountAchievement]);
      await sequelize.sync({ force: true });
}

export async function cleanupDatabase() {
    if (sequelize) {
        await sequelize.drop();
        await sequelize.close();
      }
}