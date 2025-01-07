import { hash } from "https://deno.land/x/bcrypt@v0.4.1/src/main.ts";
import { User } from "../src/model/User.ts";
import { Account } from "../src/model/Account.ts";
import { Wallet } from "../src/model/Wallet.ts";
import { Expense } from "../src/model/Expense.ts";

export async function up(){

    const hashedPassword = await hash('password');

    const data = {
        username: 'admin',
        email: 'admin@email.com',
        password: hashedPassword,
        timezone: 'Europe/Prague'
    }

    const testUser = new User(data);

    const createdUser = await testUser.save();

    const accountData = {
        experience: 0,
        credits: 0,
        level: 0,
        userId: createdUser.id,
        stayedWithinBudget: 0,
        avatarId: 1
    }

    const accountToCreate = new Account(accountData);

    const savedAccount = await accountToCreate.save();

    const walletData = {
        userId: createdUser.id,
        name: 'Test wallet',
        currency: 'CZK'
    }

    const saveWallet = new Wallet(walletData);

    const savedWallet = await saveWallet.save();

    const expenseData = {
        name: 'Initial Expense',
        amount: 10000,
        date: '2025-01-05 00:00:00+00',
        targetCategoryId: 1,
        walletId: saveWallet.id,
    }

    const expenseToSace = new Expense(expenseData);

    const savedExpense = await expenseToSace.save();        
}