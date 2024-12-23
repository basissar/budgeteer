import { RouterContext } from "@oak/oak";
import { NOT_FOUND, OK } from "../config/macros.ts";
import { AccountService } from "../service/accountService.ts";
import { AchievementService } from "../service/achievementService.ts";
import { EventType } from "../model/EventType.ts";

export class AchievementController {

    private achievementService: AchievementService;
    private accountService: AccountService;

    constructor(achievementService: AchievementService, accountService: AccountService) {
        this.achievementService = achievementService;
        this.accountService = accountService;
    }

    async getAllAchievements(ctx: RouterContext<string>) {
        const achievements = await this.achievementService.getAllAchievements();

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Achievements retrieved successfully",
            achievements: achievements
        }
    }

    async getAllAchievementsForUser(ctx: RouterContext<string>) {
        const { userId } = ctx.params;

        const account = await this.accountService.getIdForUser(userId);

        const achievements = await this.achievementService.getAllForAccount(account!.id);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Achievements retrieved successfully",
            achievements: achievements
        }
    }

    async claimAchievement(ctx: RouterContext<string>) {
        const { userId, achievementId } = ctx.params;

        const account = await this.accountService.getIdForUser(userId);

        const achievement = await this.achievementService.claimAchievement(account!.id, Number(achievementId));

        if (!achievement) {
            ctx.response.status = NOT_FOUND;
            ctx.response.body = {
                message: `Achievement has not been found`
            }
            return;
        }

        const serviceResponse = await this.accountService.handleEvent(EventType.ACHIEVEMENT, userId, achievement);

        const result = {
            eventResult: serviceResponse,
            achievement: achievement
        }

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Acheivement claimed successfully",
            achievement: achievement,
            eventResult: result
        }
    }
}