import { Sequelize } from 'npm:sequelize-typescript';
import { Budget } from '../model/Budget.ts';
import { Category } from '../model/Category.ts';
import { Goal } from '../model/Goal.ts';
import { User } from '../model/User.ts';
import { Wallet } from '../model/Wallet.ts';
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { Expense } from '../model/Expense.ts';


export const sequelize = new Sequelize({
    database: 'gukshyaq',
    username: 'gukshyaq',
    password: config()['PASSWORD'],
    host: 'cornelius.db.elephantsql.com',
    dialect: 'postgres',
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

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.addModels([User, Wallet, Category, Budget, Goal, Expense]);
        // await sequelize.sync({force: true});
        await sequelize.sync();
        console.log('Models synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.stack);
    }
}