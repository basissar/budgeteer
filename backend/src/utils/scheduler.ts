import { Cron } from "https://deno.land/x/croner@5.1.0/src/croner.js";
import { BudgetService } from "../service/budgetService.ts";
import { UserService } from "../service/userService.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";
import { Budget } from "../model/Budget.ts";
import timezonesJson from 'npm:timezones.json';
import { Timezone } from "../model/Timezone.ts";

export class Scheduler {

    private userService: UserService;
    private budgetService: BudgetService;
    private dailyCronInstance: Cron | null;
    private weeklyCronInstance: Cron | null;
    private monthlyCronInstance: Cron | null;

    // constructor() {
    //     this.userService = container.resolve(USER_SERVICE);
    //     this.budgetService = container.resolve(BUDGET_SERVICE);
    //     this.dailyCronInstance = null;
    //     this.weeklyCronInstance = null;
    //     this.monthlyCronInstance = null;

    //     if (this.userService == null || this.budgetService == null) {
    //         throw new Error("User or budget service not found. Cannot start scheduler.");
    //     }
    // }

    constructor(userService: UserService, budgetService: BudgetService) {
        this.userService = userService;
        this.budgetService = budgetService;
        this.dailyCronInstance = null;
        this.weeklyCronInstance = null;
        this.monthlyCronInstance = null;

        if (this.userService == null || this.budgetService == null) {
            throw new Error("User or budget service not found. Cannot start scheduler.");
        }
    }

    getDailyCron() {
        return this.dailyCronInstance;
    }

    getWeeklyCron() {
        return this.weeklyCronInstance;
    }

    getMonthlyCron() {
        return this.monthlyCronInstance;
    }

    start(): void {
        console.log("Starting scheduler...");
        this.dailyCronInstance = new Cron("@daily", async () => {
            await this.resetBudgets('daily');
        });

        this.weeklyCronInstance = new Cron("@weekly", async () => {
            await this.resetBudgets('weekly');
        })

        this.monthlyCronInstance = new Cron("@monthly", async () => {
            await this.resetBudgets('monthly');
        })
    }

    stop(): void {
        if (this.dailyCronInstance) {
            console.log("Stopping daily scheduler...");
            this.dailyCronInstance.stop();
        }

        if (this.weeklyCronInstance) {
            console.log("Stopping weekly scheduler...");
            this.weeklyCronInstance.stop();
        }

        if (this.monthlyCronInstance) {
            console.log("Stopping monthly scheduler...");
            this.monthlyCronInstance.stop();
        }
    }

    async resetBudgets(recurrence: string) {
        const timezones = await this.getTimeZonesForMidnight();

        const users = await this.userService.getUsersForCron(timezones, recurrence);

        if (users != null) {
            for (const user of users) {
                for (const wallet of user.getDataValue('wallets')) {
                    await Promise.all(
                        wallet.getDataValue('budgets').map(async (budget: Budget) => {
                            await this.budgetService.resetBudget(budget.id);
                            console.log(`Reset budget ${budget.id} for user ${user.id}`);
                        }) ?? []
                    );
                }
            }
        }
    }

    getTimeZonesForMidnight() {
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
     * Test function to get timezones by certain hour
     * @param hour 
     * @returns 
     */
    getTimezonesForHour(hour: number) {
        const timezones: Timezone[] = Object.values(timezonesJson) as unknown as Timezone[];

        const matchingTimezonesSet = new Set<string>();

        for (const timezone of timezones) {
            const date = DateTime.now().setZone(timezone.utc[0]);

            if (date.hour === hour) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz));
            }
        }

        const matchingTimezones: string[] = Array.from(matchingTimezonesSet);
        return matchingTimezones;
    }
}