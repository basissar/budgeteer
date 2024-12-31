import { Sequelize } from "npm:sequelize-typescript";
import { Account } from "../../src/model/Account.ts";
import { Avatar } from "../../src/model/Avatar.ts";
import { Item } from "../../src/model/Item.ts";
import { ItemEquipped } from "../../src/model/ItemEquipped.ts";
import { ItemOwned } from "../../src/model/ItemOwned.ts";
import { User } from "../../src/model/User.ts";
import pg from 'npm:pg';
import { assert } from "https://deno.land/std@0.200.0/assert/assert.ts";
import { Wallet } from "../../src/model/Wallet.ts";
import { Expense } from "../../src/model/Expense.ts";
import { Budget } from "../../src/model/Budget.ts";
import { Goal } from "../../src/model/Goal.ts";
import { Category } from "../../src/model/Category.ts";
import { ItemAvatar } from "../../src/model/ItemAvatar.ts";
import { AccountAchievement } from "../../src/model/AccountAchievement.ts";
import { Achievement } from "../../src/model/Achievement.ts";
import { ExpenseRepository } from "../../src/repository/expenseRepository.ts";

const sequelize = new Sequelize({
    database: 'postgres',
    username: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    dialectModule: pg,
    models: [Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar, Achievement, AccountAchievement],
});

Deno.test("Expense repository sum tests", async (t) => {

    const expenseRepo = new ExpenseRepository();

});