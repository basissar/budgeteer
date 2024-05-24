import { AchievementType } from "../model/AchievementType.ts";
import { AchievementService } from "../service/achievementService.ts";
import { AchievementStrategy } from "./achievementStrategy.ts";

export class ExpenseStrategy implements AchievementStrategy {

    private achievementService: AchievementService;
    
    constructor(service: AchievementService){
        this.achievementService = service;
    }

    async checkAndReward(accountId: string, type: AchievementType, data: any[]): Promise<void> {
        const achievements = await this.achievementService.findByType(type);

        const addedExpenses = data[1];

        for(const achievement of achievements){
            if (achievement.targetCount == addedExpenses){
                await this.achievementService.rewardAchievement(accountId, achievement.id);
            }
        }
    }

}