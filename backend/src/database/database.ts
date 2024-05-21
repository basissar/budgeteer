import { Sequelize } from 'npm:sequelize-typescript';
import { Budget } from '../model/Budget.ts';
import { Category } from '../model/Category.ts';
import { Goal } from '../model/Goal.ts';
import { User } from '../model/User.ts';
import { Wallet } from '../model/Wallet.ts';
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { Expense } from '../model/Expense.ts';
import pg from 'npm:pg';
import { Account } from "../model/Account.ts";
import { Avatar } from "../model/Avatar.ts";
import { Item } from "../model/Item.ts";
import { ItemAvatar } from "../model/ItemAvatar.ts";
import { ItemEquipped } from "../model/ItemEquipped.ts";
import { ItemOwned } from "../model/ItemOwned.ts";
import { Achievement } from "../model/Achievement.ts";
import { AccountAchievement } from "../model/AccountAchievement.ts";
import { GREEN, RED, RESET_COLOR, YELLOW } from "../config/macros.ts";

config({ export: true });

export const sequelize = new Sequelize({
    database: 'gukshyaq',
    username: 'gukshyaq',
    password: Deno.env.get('PASSWORD'),
    host: 'cornelius.db.elephantsql.com',
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
        connectTimeout: 60000,
    },
    pool: {
        max: 4,
        min: 0,
        acquire: 120000,
        idle: 10000
    }
});

// const sequelize = new Sequelize({
//     database: 'postgres',
//     username: 'postgres',
//     password: 'password',
//     host: 'localhost',
//     port: 5432,
//     dialect: 'postgres',
//     dialectModule: pg,
//     // models: [Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar],
// });

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log(GREEN, 'Connection has been established successfully.', RESET_COLOR);
        await sequelize.addModels([Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar, Achievement, AccountAchievement]);
        await sequelize.sync({ force: true });
        // await sequelize.sync();
        console.log(GREEN, 'Models synchronized successfully.', RESET_COLOR);
    } catch (error) {
        console.error(RED, `Unable to connect to the database: ${error.stack}`, RESET_COLOR);
    }
}