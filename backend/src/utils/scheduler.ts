import { Cron } from "https://deno.land/x/croner@5.1.0/src/croner.js";
import { container } from "./container.ts";
import { BUDGET_SERVICE, USER_SERVICE } from "../config/macros.ts";
import { BudgetService } from "../service/budgetService.ts";
import { UserService } from "../service/userService.ts";
import { DateTime } from "https://cdn.skypack.dev/luxon";

export class Scheduler {

    private userService: UserService;
    private budgetService: BudgetService;
    private cronInstance: Cron | null;

    constructor() {
        this.userService = container.resolve(USER_SERVICE);
        this.budgetService = container.resolve(BUDGET_SERVICE);
        this.cronInstance = null;

        if (this.userService == null || this.budgetService == null) {
            throw new Error("User or budget service not found. Cannot start scheduler.");
        }
    }

    start(): void {
        console.log("Starting scheduler...");
        this.cronInstance = new Cron("0 * * * *", () => {

        })
    }

    stop(): void {
        if (this.cronInstance) {
            console.log("Stopping scheduler...");
            this.cronInstance.stop();
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

}