import { AchievementType } from "../model/AchievementType.ts";
import { AchievementService } from "../service/achievementService.ts";
import { BudgetService } from "../service/budgetService.ts";
import { AchievementStrategy } from "./achievementStrategy.ts";

export class BudgetStrategy implements AchievementStrategy {

    private achievementService: AchievementService;

    constructor(achievementService: AchievementService){
        this.achievementService = achievementService;
    }

    async checkAndReward(accountId: string, type: AchievementType, data: any[]): Promise<void> {
        const achievements = await this.achievementService.findByType(type);

        const completedBudgets = data[0];

        for (const achievement of achievements) {
            if (achievement.targetCount == completedBudgets){
                await this.achievementService.rewardAchievement(accountId, achievement.id);
            }
        }
    }

}