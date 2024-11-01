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

    await t.step("ExpenseRepository.sumNegativeExpensesForMonth - sums negative expenses correctly", async () => {
        await sequelize.sync({ force: true });
        const year = 2024;
        const month = 5;
    
        // Add mock data
        await Category.create({ id: 1, name: "Test category", color: "#8A817C" });
        await Category.create({ id: 2, name: "Test category", color: "#8A817C" });
        const user = await User.create({ username: "test username", timezone: 'Europe/Prague'});
        const userId = user.id;
        const wallet = await Wallet.create({ userId: userId, name: "Test Wallet", currency: 'CZK'});
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: -100, date: new Date(year, month - 1, 1), targetCategoryId: 1 });
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: -50, date: new Date(year, month - 1, 15), targetCategoryId: 1 });
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: 200, date: new Date(year, month - 1, 20), targetCategoryId: 1 });
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: 200, date: new Date(year, month - 1, 20), targetCategoryId: 2 });
    
        const result = await expenseRepo.sumNegativeExpensesForMonth(user.id, year, month, wallet.id);
    
        assert(result == -150);
    
        await sequelize.drop();
    });

    await t.step("ExpenseRepository.sumNegativeExpensesForDateRange - sums negative expenses for date range and category", async () => {
        await sequelize.sync({ force: true });
    
        // const expenseRepo = new ExpenseRepository();
        const startDate = new Date("2024-05-01");
        const endDate = new Date("2024-05-31");
        const targetCategoryId = 1;
    
        // Add mock data
        const user = await User.create({ username: "test username", timezone: 'Europe/Prague'});
        const userId = user.id;
        const wallet = await Wallet.create({ userId: userId, name: "Test Wallet" , currency: 'CZK'});
        const category = await Category.create({ id: 1, name: "Test category", color: "#8A817C" });
        await Expense.create({name: "test expense",  walletId: wallet.id, amount: -100, date: new Date("2024-05-05"), targetCategoryId: targetCategoryId });
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: -50, date: new Date("2024-05-15"), targetCategoryId: targetCategoryId });
        await Expense.create({ name: "test expense", walletId: wallet.id, amount: 200, date: new Date("2024-05-20"), targetCategoryId: targetCategoryId });
    
        const result = await expenseRepo.sumNegativeExpensesForDateRange(userId, startDate, endDate, targetCategoryId);
    
        assert(result == -150);
    
        await sequelize.drop();
    });

    await t.step("Database cleanup", async() => {
        await sequelize.drop();
        await sequelize.close();
    })
});