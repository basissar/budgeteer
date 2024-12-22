import { Sequelize } from 'npm:sequelize-typescript';
import { SequelizeStorage, Umzug } from "npm:umzug";
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
import * as path from "node:path";

config({ export: true });

const sequelize = new Sequelize({
    database: Deno.env.get("DB_NAME"),
    username: Deno.env.get("DB_USER"),
    password: Deno.env.get("DB_PASSWORD"),
    host: Deno.env.get("DB_HOST"),
    port: Number(Deno.env.get("DB_PORT")),
    dialect: 'postgres',
    dialectModule: pg,
});

export const umzug = new Umzug({
    migrations: {
        glob: path.join(Deno.cwd(), "migrations/*.ts"),  // Changed the pattern here
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({sequelize}),
    logger: console,
});

async function runMigrations() {
    try {
        console.log(GREEN, "Running migrations", RESET_COLOR);
        const migrations = await umzug.pending();  // Get the list of pending migrations
        if (migrations.length === 0) {
            console.log(GREEN, "No new migrations to apply.", RESET_COLOR);
        } else {
            console.log(YELLOW, `Applying ${migrations.length} migration(s)...`, RESET_COLOR);
        }

        await umzug.up();
        console.log(GREEN, "Migrations applied successfully.", RESET_COLOR);
    } catch (error) {
        console.error(RED, "Error applying migrations:", error, RESET_COLOR);

        // Rollback all migrations in case of an error
        try {
            console.log(YELLOW, "Rolling back migrations...", RESET_COLOR);
            await umzug.down();
            console.log(GREEN, "Migrations rolled back successfully.", RESET_COLOR);
        } catch (rollbackError) {
            console.error(RED, "Error rolling back migrations:", rollbackError, RESET_COLOR);
        }
    }
}

export async function initializeDatabase() {
    try {
        try {
            const result = await sequelize.authenticate();
            console.log(result);
            console.log(GREEN, 'Connection has been established successfully.', RESET_COLOR);
        } catch (err) {
            console.error(err);
        }


        await sequelize.addModels([Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar, Achievement, AccountAchievement]);
        
        await runMigrations();

        // await sequelize.sync({ force: true });
        await sequelize.sync({alter: true});
        console.log(GREEN, 'Models synchronized successfully.', RESET_COLOR);
    } catch (error) {
        console.error(RED, `Unable to connect to the database: ${error}`, RESET_COLOR);
    }
}