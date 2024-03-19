import { Sequelize } from 'npm:sequelize-typescript';
import { Budget } from '../model/Budget.ts';
import { Category } from '../model/Category.ts';
import { Goal } from '../model/Goal.ts';
import { User } from '../model/User.ts';
import { Wallet } from '../model/Wallet.ts';
import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";


export const sequelize = new Sequelize({
    database: 'gukshyaq',
    username: 'gukshyaq',
    password: '**',
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
        await sequelize.addModels([User, Wallet, Category, Budget, Goal]);
        // await sequelize.sync({force: true});
        await sequelize.sync();
        console.log('Models synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.stack);
    }
}