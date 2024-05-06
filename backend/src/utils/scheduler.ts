import { Cron } from "https://deno.land/x/croner@5.1.0/src/croner.js";
import { container } from "./container.ts";
import { BUDGET_SERVICE, USER_SERVICE } from "../config/macros.ts";
import { BudgetService } from "../service/budgetService.ts";
import { UserService } from "../service/userService.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";

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

    getDailyCron(){
        return this.dailyCronInstance;
    }

    getWeeklyCron(){
        return this.weeklyCronInstance;
    }

    getMonthlyCron(){
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

    async resetBudgets(recurrence: string){
        const timezones = await this.getTimeZonesForMidnight();

            const users = await this.userService.getUsersForCron(timezones, recurrence);

            if (users != null) {
                for (const user of users) {
                    for (const wallet of user.wallets) {
                        await Promise.all(
                            wallet.budgets?.map(async (budget) => {
                                await this.budgetService.resetBudget(budget.id);
                                console.log(`Reset budget ${budget.id} for user ${user.id}`);
                            }) ?? []
                        );
                    }
                }
            }
    }

    async getTimeZonesForMidnight(){
        const path = 'C:/Users/sbasi/Documents/CVUT/5th_semester/SemestralProject/GIT/budgeteer/backend/node_modules/timezones.json/timezones.json';
        const fileContent = await Deno.readTextFile(path);

        const timezones: { utc: string[], offset: number }[] = JSON.parse(fileContent);

        const currentTimeUTC = DateTime.utc();

        const matchingTimezonesSet = new Set<string>(); // Use a Set to automatically remove duplicates

        for (const timezone of timezones) {
            const localTime = currentTimeUTC.setZone(timezone.utc[0]);
            if (localTime.hour === 0) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz)); // Add each timezone to the set
            }
        }

        const matchingTimezones: string[] = Array.from(matchingTimezonesSet); // Convert set to array
        return matchingTimezones;
    }

    /**
     * Test function to get timezones by certain hour
     * @param hour 
     * @returns 
     */
    async getTimezonesForHour(hour: number){
        const path = 'C:/Users/sbasi/Documents/CVUT/5th_semester/SemestralProject/GIT/budgeteer/backend/node_modules/timezones.json/timezones.json';
        const fileContent = await Deno.readTextFile(path);

        const timezones: { utc: string[], offset: number }[] = JSON.parse(fileContent);

        const currentTimeUTC = DateTime.utc();

        const matchingTimezonesSet = new Set<string>(); // Use a Set to automatically remove duplicates

        for (const timezone of timezones) {
            const localTime = currentTimeUTC.setZone(timezone.utc[0]);
            if (localTime.hour === hour) {
                timezone.utc.forEach(tz => matchingTimezonesSet.add(tz)); // Add each timezone to the set
            }
        }

        const matchingTimezones: string[] = Array.from(matchingTimezonesSet); // Convert set to array
        return matchingTimezones;
    }

}