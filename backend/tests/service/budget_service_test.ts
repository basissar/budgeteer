import { DateTime } from "https://cdn.skypack.dev/luxon";
import { assert } from "https://deno.land/std@0.200.0/assert/assert.ts";
import { Sequelize } from 'npm:sequelize-typescript';
import pg from 'npm:pg';
import { User } from "../../src/model/User.ts";
import { Budget } from "../../src/model/Budget.ts";
import { Category } from "../../src/model/Category.ts";
import { Expense } from "../../src/model/Expense.ts";
import { Goal } from "../../src/model/Goal.ts";
import { Wallet } from "../../src/model/Wallet.ts";
import timezones from "npm:timezones.json";
import { BudgetService } from "../../src/service/budgetService.ts";
import { saveDefaultCategories } from "../../src/utils/initializationCat.ts";
import { container } from "../../src/utils/container.ts";
import { CATEGORY_REPOSITORY, EXPENSE_REPOSITORY } from "../../src/config/macros.ts";
import { CategoryRepository } from "../../src/repository/categoryRepository.ts";
import { ExpenseRepository } from "../../src/repository/expenseRepository.ts";

Deno.test("Check weeks", () => {
    const perth = DateTime.local().setZone("Australia/Perth");

    console.log(DateTime.now().setZone("Australia/Perth"));

    const year = perth.year;
    const day = perth.day;
    const month = perth.month;

    console.log(perth);

    console.log(`Perth year: ${year}`);
    console.log(`Perth month: ${month}`);
    console.log(`Perth day: ${day}`);

    const startDay = perth.startOf('week');
    const endDay = perth.endOf('week');

    console.log(`Start of the week: ${startDay}`);
    console.log(`End of the week: ${endDay}`);

    const jsDate = new Date(year, month - 1, day);

    console.log(`Today in Perth: ${jsDate}`);
    console.log(`Today in Perth: ${perth.toJSDate()}`)
});

Deno.test("Creating new budgets", async (t) => {
    const sequelize = new Sequelize({
        database: 'postgres',
        username: 'postgres',
        password: 'password',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        dialectModule: pg,
    });

    container.register(EXPENSE_REPOSITORY, new ExpenseRepository());

    await sequelize.authenticate();
    console.log("Authenticated");
    sequelize.addModels([User, Wallet, Category, Budget, Goal, Expense]);

    await sequelize.sync();
    console.log('Models synchronized successfully.');


    await t.step("Create budget", async (t) => {
        let userId: string;
        let walletId: string;
        let budgetService: BudgetService;

        await t.step("Preparation phase", async (t) => {
            await t.step("Create user", async () => {
                const user = new User({
                    username: "test user",
                    email: "user@example.com",
                    password: "password",
                    timezone: "Europe/Paris"
                });

                userId = user.id;

                await user.save();

                console.log(`User created: ${user.username}`);
            })

            await t.step("Create wallet for user", async () => {
                const wallet = new Wallet({
                    userId: userId,
                    name: "Wallet name",
                    currency: "EUR"
                });

                walletId = wallet.id;

                await wallet.save();

                console.log(`Wallet created: ${wallet.name}`);
            });

            await t.step("Initialize categories", async () => {
                try {
                    await saveDefaultCategories();
                } catch (err) {
                    throw new Error(err.stack);
                }

            })

            await t.step("Initialize Budget service", () => {
                try {
                    budgetService = new BudgetService();
                } catch (err) {
                    throw new Error(`Error initializing budget service: ${err.message}`);
                }

            })
        });

        await t.step("Budget saving via service (no expenses)", async () => {
            try {
                const budget = new Budget({
                    limit: 2000,
                    recurrence: 'daily',
                    categoryId: 3,
                    walletId: walletId,
                    name: "First budget"
                });

                await budgetService.createBudget(userId, budget);

                const foundBudget = await budgetService.findById(budget.id);

                assert(foundBudget != null);

                assert(budget.name == foundBudget?.name);
                assert(budget.currentAmount == foundBudget?.currentAmount);
            } catch (error) {
                throw new Error(`Error creating budget via service: ${error.stack}`);
            }

        });

        await t.step("Budget saving via service with some expenses", async (t) => {

            await t.step("Create some expenses", async () => {
                const date = new Date();
                date.setHours(0,0,0,0);

                const expenses = [
                    {
                        name: "expense 1",
                        amount: -100,
                        date: date,
                        targetCategoryId: 2,
                        walletId: walletId
                    },
                    {
                        name: "expense 2",
                        amount: -200,
                        date: date,
                        targetCategoryId: 2,
                        walletId: walletId
                    },
                    {
                        name: "expense 3",
                        amount: 100,
                        date: date,
                        targetCategoryId: 2,
                        walletId: walletId
                    }
                ]

                for (const exp of expenses){
                    const toSave = new Expense(exp);
                    await toSave.save();
                }

                const allFoundExp = await Expense.findAll({
                    where: {
                        walletId: walletId
                    }
                });

                console.log(allFoundExp);

                const foundExpenses = await budgetService.expenseRepository.findByDate(walletId,date,2);

                assert(foundExpenses.length == 3);
            });

            await t.step("Create budget with expenses", async(t) => {
                const budget = new Budget({
                    limit: 1500,
                    recurrence: 'daily',
                    categoryId: 2,
                    walletId: walletId,
                    name: "Second budget"
                });

                await budgetService.createBudget(userId, budget);

                const foundBudget = await budgetService.findById(budget.id);

                assert(foundBudget != null);

                assert(budget.name == foundBudget?.name);
                assert(budget.currentAmount == foundBudget?.currentAmount);

                assert(foundBudget.currentAmount != 0);
            });

        })

    });

    await t.step("Database cleanup", async () => {
        await sequelize.drop();
        await sequelize.close();
    })

});