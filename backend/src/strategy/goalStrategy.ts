import { AchievementType } from "../model/AchievementType.ts";
import { GoalRepository } from "../repository/goalRepository.ts";
import { AchievementService } from "../service/achievementService.ts";
import { AchievementStrategy } from "./achievementStrategy.ts";

export class GoalCompletionStrategy implements AchievementStrategy {

    private achievementService: AchievementService;

    constructor( achievementService: AchievementService) {
        this.achievementService = achievementService;
    }
    
    /**
     * 
     * @param accountId 
     * @param type 
     * @param data data[1] is a count of completed goals
     */
    async checkAndReward(accountId: string, type:AchievementType, data: any[]): Promise<void> {
        const achievements = await this.achievementService.findByType(type);

        const completedGoals = data[0];

        for(const achievement of achievements){
            if (achievement.targetCount == completedGoals){
                await this.achievementService.rewardAchievement(accountId, achievement.id);
            }
        }
    }

}