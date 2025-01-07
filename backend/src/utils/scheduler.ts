import { Cron } from "https://deno.land/x/croner@5.1.0/src/croner.js";
import { BudgetService } from "../service/budgetService.ts";
import { UserService } from "../service/userService.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";
import { Budget } from "../model/Budget.ts";
import timezonesJson from 'npm:timezones.json';
import { Timezone } from "../model/Timezone.ts";
import { AccountService } from "../service/accountService.ts";
import { EventType } from "../model/EventType.ts";
import { AchievementService } from "../service/achievementService.ts";
import { AchievementType } from "../model/AchievementType.ts";
import { Account } from "../model/Account.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";

export class Scheduler {

    private userService: UserService;
    private budgetService: BudgetService;
    private accountService: AccountService;
    private achievementService: AchievementService;
    private hourlyCronInstance: Cron | null;

    constructor(userService: UserService, budgetService: BudgetService, accountService: AccountService, achievementService: AchievementService) {
        this.userService = userService;
        this.budgetService = budgetService;
        this.accountService = accountService;
        this.achievementService = achievementService;
        this.hourlyCronInstance = null;

        if (this.userService == null || this.budgetService == null) {
            throw new Error("User or budget service not found. Cannot start scheduler.");
        }
    }

    getHourlyCron() {
        return this.hourlyCronInstance;
    }

    start(): void {
        console.log("Starting scheduler...");
        this.hourlyCronInstance = new Cron("0 * * * *", async () => {
            await this.resetBudgets();
        });
    }

    stop(): void {
        if (this.hourlyCronInstance) {
            console.log("Stopping scheduler...");
            this.hourlyCronInstance.stop();
        }
    }

    /**
     * Resets budgets
     */
    private async resetBudgets() {
        const dailyTimezones = await this.getTimeZonesForMidnight();

        const weeklyTimezones = await this.getTimeZonesForMidnightOnMonday();

        const monthlyTimezones = await this.getTimeZonesForMidnightOnFirstOfMonth();

        const yearlyTimezones = await this.getTimeZonesForMidnightOnFirstOfYear();

        const dailyUsers = await this.userService.getUsersForCron(dailyTimezones, 'daily');

        const weeklyUsers = await this.userService.getUsersForCron(weeklyTimezones, 'weekly');

        const monthlyUsers = await this.userService.getUsersForCron(monthlyTimezones, 'monthly');

        const yearlyUsers = await this.userService.getUsersForCron(yearlyTimezones, 'yearly');

        if (dailyUsers != null) {
            for (const user of dailyUsers) {
                for (const wallet of user.getDataValue('wallets')) {
                    await Promise.all(
                        wallet.getDataValue('budgets').map(async (budget: Budget) => {

                            await this.handleCountCheck(budget.id, user.id);

                            await this.budgetService.resetBudget(budget.id);
                            console.log(`Reset budget ${budget.id} for user ${user.id}`);
                        }) ?? []
                    );
                }
            }
        }

        if (weeklyUsers != null) {
            for (const user of weeklyUsers) {
                for (const wallet of user.getDataValue('wallets')) {
                    await Promise.all(
                        wallet.getDataValue('budgets').map(async (budget: Budget) => {

                            await this.handleCountCheck(budget.id, user.id);

                            await this.budgetService.resetBudget(budget.id);
                            console.log(`Reset budget ${budget.id} for user ${user.id}`);
                        }) ?? []
                    );
                }
            }
        }

        if (monthlyUsers != null) {
            for (const user of monthlyUsers) {
                for (const wallet of user.getDataValue('wallets')) {
                    await Promise.all(
                        wallet.getDataValue('budgets').map(async (budget: Budget) => {

                            await this.handleCountCheck(budget.id, user.id);

                            await this.budgetService.resetBudget(budget.id);
                            console.log(`Reset budget ${budget.id} for user ${user.id}`);
                        }) ?? []
                    );
                }
            }
        }

        if (yearlyUsers != null) {
            for (const user of yearlyUsers) {
                for (const wallet of user.getDataValue('wallets')) {
                    await Promise.all(
                        wallet.getDataValue('budgets').map(async (budget: Budget) => {

                            await this.handleCountCheck(budget.id, user.id);

                            await this.budgetService.resetBudget(budget.id);
                            console.log(`Reset budget ${budget.id} for user ${user.id}`);
                        }) ?? []
                    );
                }
            }
        }
    }

    /**
     * Checks if budget went over limit and user is eligible for an achievement
     * @param budgetId 
     * @param userId 
     */
    private async handleCountCheck(budgetId: number, userId: string) {
        const overLimit = await this.budgetService.checkBudgetLimit(budgetId);

        const account = await Account.findOne({
            where: {
                userId: userId
            },
            attributes: [
                'id',
                'stayedWithinBudget'
            ]
        });

        const newBudgetCount = account!.stayedWithinBudget + 1;

        account!.set('stayedWithinBudget', newBudgetCount);
        account!.save();

        if (!overLimit) {
            await this.accountService.handleEvent(EventType.WITHIN_BUDGET, userId);
            await this.achievementService.evaluateAchievement(account!.id, AchievementType.BUDGET, [newBudgetCount]);
        }
    }

    /**
     * Gets timezones for daily recurrence budgets
     * @returns 
     */
    private getTimeZonesForMidnight() {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];

        const matchingTimezonesSet = new Set<string>();

        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);

            if (date.hour === 0) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }

        const matchingTimezones: string[] = Array.from(matchingTimezonesSet);
        return matchingTimezones;
    }

    /**
     * Gets timezones for weekly recurrence budgets
     * @returns 
     */
    private getTimeZonesForMidnightOnMonday() {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];
        const matchingTimezonesSet = new Set<string>();

        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);

            if (date.hour === 0 && date.weekday === 1) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }

        return Array.from(matchingTimezonesSet);
    }

    /**
     * Gets timezones for monthly recurrence budgets
     * @returns 
     */
    private getTimeZonesForMidnightOnFirstOfMonth() {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];
        const matchingTimezonesSet = new Set<string>();
    
        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);
    
            if (date.hour === 0 && date.day === 1) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }
    
        return Array.from(matchingTimezonesSet);
    }

    /**
     * Gets timezones for yearly recurrence budgets
     * @returns 
     */
    private getTimeZonesForMidnightOnFirstOfYear() {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];
        const matchingTimezonesSet = new Set<string>();
    
        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);
    
            if (date.hour === 0 && date.day === 1 && date.month === 1) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }
    
        return Array.from(matchingTimezonesSet);
    }


    /**
     * Custom function to retrieve timezones by specific time
     * @param hour 
     * @returns 
     */
    private getTimezonesForHour(hour: number, minute: number) {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];

        const matchingTimezonesSet = new Set<string>();

        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);

            if (date.hour === hour && date.minute === minute) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }

        const matchingTimezones: string[] = Array.from(matchingTimezonesSet);
        return matchingTimezones;
    }
}