import { AchievementType } from "../model/AchievementType.ts";
import { AchievementStrategy } from "./achievementStrategy.ts";

export class AchievementContext {
    private strategy!: AchievementStrategy;

    setStrategy(strategy: AchievementStrategy){
        this.strategy = strategy;
    }

    async executeStrategy(accountId: string, type: AchievementType, data: any[]){
        await this.strategy.checkAndReward(accountId, type, data);
    }
}